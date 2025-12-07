FROM php:8.2-cli

WORKDIR /var/www

# Cài package hệ thống
RUN apt-get update && apt-get install -y \
    git unzip curl libonig-dev libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring zip

# Copy toàn bộ source vào container
COPY . .

# Cài composer
RUN curl -sS https://getcomposer.org/installer | php \
    -- --install-dir=/usr/local/bin --filename=composer

# Cài Laravel dependencies
RUN composer install --no-dev --optimize-autoloader

# Phân quyền
RUN chmod -R 777 storage bootstrap/cache

# Expose port Render dùng
EXPOSE 10000

# Chạy Laravel (giữ container sống)
CMD php -S 0.0.0.0:10000 -t public
