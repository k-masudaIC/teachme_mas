FROM php:8.2-fpm

# 必要なパッケージのインストール
RUN apt-get update \
    && apt-get install -y \
        git \
        unzip \
        libzip-dev \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
        ffmpeg \
    && docker-php-ext-install pdo_mysql zip mbstring exif pcntl bcmath gd

# Composerインストール
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html





# php.iniを直接配置（最優先で読み込ませる）
COPY php.ini /usr/local/etc/php/php.ini

EXPOSE 9000

CMD ["php-fpm"]
