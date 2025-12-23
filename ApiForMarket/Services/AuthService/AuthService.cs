using ApiForMarket.Data;
using ApiForMarket.Dtos.Helpers;
using ApiForMarket.Dtos.Users;
using ApiForMarket.Models;
using ApiForMarket.Services.PasswordHasherService;
using ApiForMarket.Services.TokenService;
using Microsoft.EntityFrameworkCore;

namespace ApiForMarket.Services.AuthService
{
    public class AuthService : IAuthService
    {
        private readonly IPasswordHasherService _passwordHasherService;
        private readonly ITokenService _tokenService;
        private readonly ApplicationDBContext _dbcontext;

        public AuthService(IPasswordHasherService passwordHasher, ITokenService tokenService, ApplicationDBContext dBContext)
        {
            _passwordHasherService = passwordHasher;
            _tokenService = tokenService;
            _dbcontext = dBContext;
        }

        public async Task<Message> Login(UserDTO user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            if (string.IsNullOrWhiteSpace(user.Email))
                throw new ArgumentException("Email cannot be empty", nameof(user.Email));

            if (string.IsNullOrWhiteSpace(user.Password))
                throw new ArgumentException("Password cannot be empty", nameof(user.Password));

            var validUser = await _dbcontext.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            if (validUser == null)
            {
                return new Message(false, "Not found", StatusCodes.NotFound);
            }

            var isPswCorrect = _passwordHasherService.VerifyPassword(validUser, validUser.HashPassword!, user.Password);

            if (!isPswCorrect)
            {
                return new Message(false, "Not found", StatusCodes.NotFound);
            }

            var token = _tokenService.CreateToken(validUser);
            string rfToken = await GenerateAndSaveRefreshToken(validUser);

            return new UserMessage(true, "Success", StatusCodes.Success,  validUser, token, rfToken); 
        }

        public async Task<Message> RefreshTokens(RefreshTokenDto request)
        {
            var user = await ValidateRefreshTokenAsync(request.UserId, request.Token);
            if (user is null)
            {
                return new Message(false, "Token is not valid", StatusCodes.Error);
            }
            var access = _tokenService.CreateToken(user);
            var refresh = await GenerateAndSaveRefreshToken(user);

            return new UserMessage(true, "Success", StatusCodes.Success, user, access, refresh);
        }

        public async Task<Message> Register(UserDTO user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            if (string.IsNullOrWhiteSpace(user.Email))
                throw new ArgumentException("Email cannot be empty", nameof(user.Email));

            if (string.IsNullOrWhiteSpace(user.Password))
                throw new ArgumentException("Password cannot be empty", nameof(user.Password));

            var userExists = await _dbcontext.Users.AnyAsync(u => u.Email == user.Email);
            if (userExists)
            {
                return new Message(false, "User allready exist", StatusCodes.AlreadyExist);
            }
            try
            {
                var newUser = new User()
                {
                    Id = Guid.NewGuid(),
                    Email = user.Email,
                    Role = UserRole.User
                };

                var hashedPsw = _passwordHasherService.HashPassword(newUser, user.Password);

                newUser.HashPassword = hashedPsw;
                _dbcontext.Users.Add(newUser);
                await _dbcontext.SaveChangesAsync();
                var token = _tokenService.CreateToken(newUser);
                string rfToken = await GenerateAndSaveRefreshToken(newUser);
                return new UserMessage(true, "Success", StatusCodes.Success, newUser, token, rfToken);
            }
            catch (Exception ex)
            {
                return new Message(false, $"DBerrror: {ex.ToString()}", StatusCodes.Error);
            }
        }

        private async Task<string> GenerateAndSaveRefreshToken(User user)
        {
            var refRoken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = refRoken;

            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(14);

            await _dbcontext.SaveChangesAsync();

            return user.RefreshToken;
        }

        private async Task<User?> ValidateRefreshTokenAsync(Guid userId, string refreshToken)
        {
            var user = await _dbcontext.Users.FindAsync(userId);

            if (user == null ||
                user.RefreshToken != refreshToken ||
                user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return null;
            }

            return user;
        }
    }
}
