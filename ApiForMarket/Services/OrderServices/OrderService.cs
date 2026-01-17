using ApiForMarket.Data;
using ApiForMarket.Dtos.OrderDTO;
using ApiForMarket.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiForMarket.Services.OrderServices
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDBContext _dbContext;

        public OrderService(ApplicationDBContext dBContext)
        {
            _dbContext = dBContext;
        }


        public async Task<OrderResult<OutputOrderData>> CreateOrder(Guid userId, CreateOrderDTO orderDTO)
        {
            if (orderDTO == null)
            {
                return new OrderResult<OutputOrderData>
                {
                    Message = "Order data is null",
                    Result = OrdersDatabaseResults.InvalidProductId
                };
            }
            if (userId == Guid.Empty)
            {
                return new OrderResult<OutputOrderData>
                {
                    Message = "Invalid user id",
                    Result = OrdersDatabaseResults.InvalidUserId
                };
            }
            var userExists = await _dbContext.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                return new OrderResult<OutputOrderData>
                {
                    Message = "User not found",
                    Result = OrdersDatabaseResults.InvalidUserId
                };
            }
            if (orderDTO.ProductId == Guid.Empty)
            {
                return new OrderResult<OutputOrderData>
                {
                    Message = "Invalid product id",
                    Result = OrdersDatabaseResults.InvalidProductId
                };
            }
            var product = await _dbContext.Products
                .Include(p => p.Shop)
                .FirstOrDefaultAsync(p => p.Id == orderDTO.ProductId);

            if (userId == product?.Shop?.UserId)
            {
                return new OrderResult<OutputOrderData>
                {
                    Message = "You cant buy your product",
                    Result = OrdersDatabaseResults.CantByMySelf
                };
            }
            if (product == null)
            {
                return new OrderResult<OutputOrderData>
                {
                    Message = "Product not found",
                    Result = OrdersDatabaseResults.InvalidProductId
                };
            }
            if (!IsModerated(product))
            {
                return new OrderResult<OutputOrderData>()
                {
                    Message = "Data is unModerated",
                    Result = OrdersDatabaseResults.UnModeratedData
                };
            }

            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TotalPrice = product.Price,
                Status = OrderStatus.Created
            };

            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                ProductImage = product.Img,
                ProductPrice = product.Price,
                ShopId = product.ShopId,
                ShopName = product.Shop.Name,
                Quantity = 1
            };


            order.Items.Add(orderItem);

            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                _dbContext.Orders.Add(order);
                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return new OrderResult<OutputOrderData>()
                {
                    Items = new List<OutputOrderData>()
                    {
                        new OutputOrderData()
                        {
                            OrderId = order.Id,
                            NameProduct = orderItem.ProductName,
                            ShopName = product.Shop.Name,
                            Status = order.Status,
                            Price = order.TotalPrice,
                            ShopId = product.ShopId,
                            ProductId= product.Id,
                            ProductImage = product.Img
                        }
                    },
                    Message = "Order is created",
                    Result = OrdersDatabaseResults.Success
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                return new OrderResult<OutputOrderData>()
                {
                    Message = "DBERROR",
                    Result = OrdersDatabaseResults.DbError
                };
                throw;
            }


        }

        public async Task<OrderResult<OutputOrderData>> GetOrderById(Guid orderId, Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return new OrderResult<OutputOrderData>() { Message = "UserId is null", Result = OrdersDatabaseResults.InvalidUserId };
            }
            if (orderId == Guid.Empty)
            {
                return new OrderResult<OutputOrderData>() { Message = "OrderId is null", Result = OrdersDatabaseResults.InvalidOrderId };
            }

            var order = await _dbContext.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Shop)
            .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return new OrderResult<OutputOrderData>() { Message = "Order not found", Result = OrdersDatabaseResults.InvalidOrderId };
            }

            var ownerShopId = order.Items?.FirstOrDefault()?.Shop?.UserId;

            if (order.UserId != userId && userId != ownerShopId)
            {
                return new OrderResult<OutputOrderData>() { Message = "User cant check this information", Result = OrdersDatabaseResults.NotEnoughRights };
            }

            return new OrderResult<OutputOrderData>()
            {
                Result = OrdersDatabaseResults.Success,
                Items = new List<OutputOrderData>()
                {
                    new OutputOrderData()
                    {
                        OrderId = orderId,
                        ShopName = order.Items.First().ShopName,
                        ShopId = order.Items.First().ShopId,
                        NameProduct = order.Items.First().ProductName,
                        ProductId = order.Items.First().ProductId,
                        Price = order.TotalPrice,
                        Status = order.Status,
                        ProductImage = order.Items.First().ProductImage,
                        Role = ownerShopId == userId ? Roles.IsSeller : Roles.IsBuyer,
                    }
                }
            };

        }

        public async Task<OrderResult<OutputOrderData>> GetUserOrderByUserId(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return new OrderResult<OutputOrderData>()
                {
                    Message = "UserId is null",
                    Result = OrdersDatabaseResults.InvalidUserId
                };
            }

            var userOrders = await _dbContext.Orders.Where(o => o.UserId == userId).Include(o => o.Items).Select(o => new OutputOrderData()
            {
                NameProduct = o.Items.First().ProductName,
                ShopName = o.Items.First().ShopName,
                OrderId = o.Id,
                ShopId = o.Items.First().ShopId,
                ProductId = o.Items.First().ProductId,
                Price = o.TotalPrice,
                Status = o.Status

            }).ToListAsync();

            return new OrderResult<OutputOrderData>() { Items = userOrders, Result = OrdersDatabaseResults.Success };
        }

        public Task<OrderResult<OutputOrderData>> GetUserOrders(Guid userId)
        {
            throw new NotImplementedException();
        }

        public async Task<OrderChatAccessResult> CheckOrderAccessAsync(Guid orderId, Guid userId)
        {
            if (orderId == Guid.Empty || userId == Guid.Empty)
                return Denied();

            var order = await _dbContext.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.Shop)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null || order.Items.Count == 0)
                return Denied();

            var isBuyer = order.UserId == userId;
            var isSeller = order.Items.Any(i => i.Shop.UserId == userId);

            if (!isBuyer && !isSeller)
                return Denied();

            var canWrite = order.Status == OrderStatus.Paid;

            return new OrderChatAccessResult
            {
                HasAccess = true,
                CanWrite = canWrite,
                Role = isBuyer ? Roles.IsBuyer : Roles.IsSeller,
                Order = new OutputOrderData
                {
                    OrderId = order.Id,
                    NameProduct = order.Items.First().ProductName,
                    ShopName = order.Items.First().ShopName,
                    ShopId = order.Items.First().ShopId,
                    ProductId = order.Items.First().ProductId,
                    Price = order.TotalPrice,
                    Status = order.Status
                }
            };
        }

        private static OrderChatAccessResult Denied() => new()
        {
            HasAccess = false,
            CanWrite = false
        };


        private bool IsModerated(Product product)
        {
            if (product.Shop == null)
                return false;

            var isShopApproved = product.Shop.IsModerated == Moderated.Modareted;
            var isPorductApproved = product.IsModerated == Moderated.Modareted;

            return isShopApproved && isPorductApproved;
        }

        public async Task<OrderResult<OutputOrderData>> GetOrdersByShopId(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return new OrderResult<OutputOrderData>()
                {
                    Message = "UserId is required",
                    Result = OrdersDatabaseResults.InvalidUserId
                };
            }

            var shop = await _dbContext.Shops
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId);

            if (shop == null)
            {
                return new OrderResult<OutputOrderData>()
                {
                    Result = OrdersDatabaseResults.ShopNotFound,
                    Message = "Shop not found"
                };
            }

            var shopId = shop.Id;

            if (shopId == Guid.Empty)
            {
                return new OrderResult<OutputOrderData>()
                {
                    Message = "ShopId is required",
                    Result = OrdersDatabaseResults.InvalidShopId
                };
            }

            try
            {

                if (shop.UserId != userId)
                {
                    return new OrderResult<OutputOrderData>()
                    {
                        Result = OrdersDatabaseResults.NotEnoughRights,
                        Message = "No access rights to this shop"
                    };
                }

                var orders = await _dbContext.Orders
                    .AsNoTracking()
                    .Where(o => o.Items.Any(item => item.ShopId == shopId))
                    .Select(o => new OutputOrderData()
                    {
                        ShopId = shopId,
                        ShopName = shop.Name,
                        Price = o.TotalPrice,
                        OrderId = o.Id,
                        Status = o.Status,
                        NameProduct = o.Items
                            .Where(item => item.ShopId == shopId)
                            .Select(item => item.ProductName)
                            .FirstOrDefault() ?? "Unknown product",
                        ProductId = o.Items
                            .Where(item => item.ShopId == shopId)
                            .Select(item => item.ProductId)
                            .FirstOrDefault(),
                        ProductImage = o.Items
                            .Where(item => item.ShopId == shopId)
                            .Select(item => item.ProductImage)
                            .FirstOrDefault() ?? string.Empty
                    })
                    .OrderByDescending(o => o.OrderId)
                    .ToListAsync();

                return new OrderResult<OutputOrderData>
                {
                    Items = orders ?? new List<OutputOrderData>(),
                    Result = OrdersDatabaseResults.Success,
                    Message = $"Found {orders?.Count ?? 0} orders"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetOrdersByShopId: {ex.Message}");
                return new OrderResult<OutputOrderData>()
                {
                    Result = OrdersDatabaseResults.DbError,
                    Message = "An error occurred while retrieving orders",
                    Items = new List<OutputOrderData>()
                };
            }
        }

        public async Task<bool> Buy(Guid userId, Guid orderId)
        {
            if (userId == Guid.Empty)
            {
                return false;
            }
            if (orderId == Guid.Empty)
            {
                return false;
            }

            var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return false;
            }

            try
            {
                order.Status = OrderStatus.Paid;
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex) 
            {
                return false;
            }

            return true;

        }
    }
}
