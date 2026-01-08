FROM php:8.3.7-apache

RUN a2enmod rewrite
RUN apt-get update && apt-get install -y \
    libxml2-dev \
    libzip-dev \
    libcurl4-openssl-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    locales \
    libonig-dev \
    git \
    unzip \
    zip \
    curl \
    ssmtp \
    build-essential \
    zlib1g-dev \
    libssl-dev \
    libreadline-dev \
    libsqlite3-dev \
    wget \
    python3 \
    python3-pip \
 && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    mysqli \
    bcmath \
    mbstring \
    dom \
    fileinfo \
    zip \
    gd \
    xml

RUN pecl install xdebug \
 && docker-php-ext-enable xdebug

COPY ./docker-smtp.ini /usr/local/etc/php/conf.d/docker-smtp.ini
COPY ./docker-param.ini /usr/local/etc/php/conf.d/docker-param.ini
COPY ./ssmtp.conf /etc/ssmtp/ssmtp.conf

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
