# Этап 1: Сборка
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Копируем csproj из папки ApiForMarket
COPY ["./ApiForMarket/ApiForMarket.csproj", "."]
RUN dotnet restore "ApiForMarket.csproj"

# Копируем весь остальной код из папки ApiForMarket
COPY ./ApiForMarket/ .

# Публикуем приложение
RUN dotnet publish "ApiForMarket.csproj" -c Release -o /app/publish

# Этап 2: Финальный образ
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Копируем опубликованное приложение
COPY --from=build /app/publish .

# Копируем папку uploads из этапа сборки
COPY --from=build /src/uploads ./uploads/

# Создаем структуру директорий (на всякий случай)
RUN mkdir -p uploads/shops && \
    chmod -R 755 uploads

EXPOSE 8080

ENTRYPOINT ["dotnet", "ApiForMarket.dll"]