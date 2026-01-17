using ApiForMarket.Data;
using ApiForMarket.Models;
using ApiForMarket.Services.AuthService;
using ApiForMarket.Services.CategoryService;
using ApiForMarket.Services.FileService;
using ApiForMarket.Services.OrderChatService;
using ApiForMarket.Services.OrderServices;
using ApiForMarket.Services.PasswordHasherService;
using ApiForMarket.Services.ProductService;
using ApiForMarket.Services.ShopService;
using ApiForMarket.Services.TokenService;
using ApiForMarket.Services.UserService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;


namespace ApiForMarket
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddDbContext<ApplicationDBContext>(opt =>
            {
                opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
            });

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(opt =>
                {
                    opt.TokenValidationParameters = new TokenValidationParameters()
                    {
                        ValidateAudience = true,
                        ValidAudience = builder.Configuration["AppSettings:Audience"],
                        ValidateIssuer = true,
                        ValidIssuer = builder.Configuration["AppSettings:Issuer"],
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                            builder.Configuration["AppSettings:Token"]!)),

                    };
                    opt.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var path = context.HttpContext.Request.Path;
                            if (path.StartsWithSegments("/hubs/order-chat"))
                            {
                                // Проверяем токен в query string
                                var accessToken = context.Request.Query["access_token"];
                                if (!string.IsNullOrEmpty(accessToken))
                                {
                                    context.Token = accessToken;
                                }
                                // Если токена нет в query, проверяем заголовок Authorization
                                else
                                {
                                    var authHeader = context.Request.Headers["Authorization"].ToString();
                                    if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                                    {
                                        context.Token = authHeader.Substring("Bearer ".Length).Trim();
                                    }
                                }
                            }
                            return Task.CompletedTask;
                        }
                    };
                });

            builder.Services.AddCors(opt =>
            {
                opt.AddPolicy("AllowFront", policy =>
                {
                    policy.AllowAnyHeader()
                    .AllowCredentials()
                    .AllowAnyMethod()
                    .WithOrigins("http://localhost:5173", "https://guleb23-frontmarket-d3dd.twc1.net", "http://62.113.36.15:3000");
                });
            });
            builder.Services.AddSignalR();

            builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

            builder.Services.AddScoped<IOrderChatService, OrderChatService>();
            builder.Services.AddScoped<ITokenService, TokenService>();
            builder.Services.AddScoped<ICategoryService, CategoryService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IProductService, ProductService>();
            builder.Services.AddScoped<IFileService, FileService>();
            builder.Services.AddScoped<IPasswordHasherService, PasswordHasherService>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IShopService, ShopService>();
            builder.Services.AddScoped<IOrderService, OrderService>();
            builder.Services.AddControllers();
            builder.Services.AddOpenApi();

            var app = builder.Build();


            app.MapOpenApi();
            app.MapScalarApiReference("/docs");

            var contentRootPath = app.Environment.ContentRootPath;
            var uploadsPath = Path.Combine(contentRootPath, "uploads");
            var shopsUploadsPath = Path.Combine(uploadsPath, "shops");

            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);
            if (!Directory.Exists(shopsUploadsPath))
                Directory.CreateDirectory(shopsUploadsPath);

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(uploadsPath),
                RequestPath = "/uploads",
                ServeUnknownFileTypes = true,
                OnPrepareResponse = ctx =>
                {
                    ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
                    ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=3600");
                }
            });

            app.UseRouting();

            app.UseCors("AllowFront");

            app.UseAuthentication();
            app.UseAuthorization();
            app.MapHub<OrderChatHub>("/hubs/order-chat");

            app.MapControllers();

            app.MapGet("/", () =>
            {
                return "Servier is running!!!";
            });

            app.Run();
        }
    }
}
