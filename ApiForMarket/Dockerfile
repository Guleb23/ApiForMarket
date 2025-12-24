# Этап 1: Сборка
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Копируем все файлы
COPY . .

# Восстанавливаем зависимости и публикуем
RUN dotnet restore && \
    dotnet publish -c Release -o out

# Этап 2: Финальный образ
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Копируем собранное приложение
COPY --from=build /app/out .

# Копируем папку uploads с фото из исходного кода (если существует)
COPY --from=build /app/uploads ./ApiForMarket/uploads/

# Создаем директории uploads если их нет в исходном коде
RUN mkdir -p uploads/shops

# Настраиваем права доступа
RUN chmod -R 755 uploads

EXPOSE 8080

ENTRYPOINT ["dotnet", "ApiForMarket.dll"]