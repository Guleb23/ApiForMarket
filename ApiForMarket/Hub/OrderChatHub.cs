using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using ApiForMarket.Services.OrderServices;
using System.Security.Claims;
using ApiForMarket.Services.OrderChatService;
using ApiForMarket.Models;

[Authorize]
public class OrderChatHub : Hub
{
    private readonly IOrderService _orderService;
    private readonly IOrderChatService _chatService;

    public OrderChatHub(IOrderService orderService, IOrderChatService chatService)
    {
        _orderService = orderService;
        _chatService = chatService;
    }

    public override async Task OnConnectedAsync()
    {
        try
        {
            var http = Context.GetHttpContext();
            var userClaim = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!Guid.TryParse(userClaim, out var userId))
            {
                Context.Abort();
                return;
            }

            var orderIdRaw = http?.Request.Query["orderId"];
            if (!Guid.TryParse(orderIdRaw, out var orderId))
            {
                Context.Abort();
                return;
            }

            var access = await _orderService.CheckOrderAccessAsync(orderId, userId);

            if (!access.HasAccess)
            {
                Context.Abort();
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"order-{orderId}");

            await Clients.Caller.SendAsync("ChatPermissions", new
            {
                canWrite = access.CanWrite,
                role = access.Role
            });

            // 🔹 Отправляем историю сообщений ОДНИМ МАССИВОМ
            var messages = await _chatService.GetMessages(orderId);
            var orderedMessages = messages.OrderBy(m => m.CreatedAt).ToList();

            await Clients.Caller.SendAsync("ReceiveHistory", new
            {
                messages = orderedMessages.Select(m => new
                {
                    id = m.Id,
                    text = m.Text,
                    senderId = m.SenderId,
                    createdAt = m.CreatedAt
                }).ToArray()
            });

            await base.OnConnectedAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine("❌ Ошибка в OnConnectedAsync: " + ex);
            Context.Abort();
        }
    }

    public async Task SendMessage(Guid orderId, string text)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(text))
                return;

            var userIdClaim = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return;
            }

            // Проверка прав доступа к заказу
            var res = await _orderService.CheckOrderAccessAsync(orderId, userId);
            if (!res.HasAccess || res.Order == null)
            {
                return;
            }

            var order = res.Order;
            // Проверка статуса заказа
            if (order.Status != OrderStatus.Paid && order.Status != OrderStatus.Completed)
            {
                return;
            }

            var message = new OrderChatMessage
            {
                Id = Guid.NewGuid(),
                OrderId = orderId,
                SenderId = userId,
                Text = text.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            await _chatService.AddMessage(message);

            // Отправляем сообщение всем в группе
            await Clients.Group($"order-{orderId}")
                .SendAsync("ReceiveMessage", new
                {
                    id = message.Id,
                    text = message.Text,
                    senderId = message.SenderId,
                    createdAt = message.CreatedAt
                });
        }
        catch
        {
            // Логируем ошибку
        }
    }


}