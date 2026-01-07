<?php

namespace Doink;

class Route extends Doink
{
    public static function getPath(string $routeName): string
    {
        $routes = [
            'home' => '/',
            'chat' => '/chat',
            'game' => '/game',
        ];

        return $routes[$routeName] ?? '/';
    }
}