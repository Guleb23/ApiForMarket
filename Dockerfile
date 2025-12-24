# Этап 1: Сборка
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore && dotnet publish -c Release -o /app/publish

# Этап 2: Финальный образ
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Копируем опубликованное приложение
COPY --from=build /app/publish .

# Копируем папку wwwroot со статическими файлами
COPY --from=build /src/wwwroot ./wwwroot/

# Создаем структуру директорий для uploads
RUN mkdir -p uploads && \
    mkdir -p uploads/shops && \
    chmod -R 755 uploads

EXPOSE 8080
ENTRYPOINT ["dotnet", "ApiForMarket.dll"]