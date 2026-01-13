<?php

namespace Doink;

/* the doink master class */
class Doink
{

    private $cache_bust = "v=20260113.1"; // Change this to bust cache on new deploys
    private $title;
    private $description;

    public function getLocation(){

    }  
    public function getVersion(): string
    {
        return '1.0.1';
    }

    public function cacheBust(): string
    {
        return $this->cache_bust;
    }   

    public function title(): string
    {
        return $this->title ?? "Doink";
    }

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    public function description(): string
    {
        return $this->description ?? "Doink Description.";
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
    }

    public function ogImageUrl(): string
    {
        $scheme = $_SERVER['REQUEST_SCHEME'] ?? (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http');
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return $scheme . '://' . $host . '/resources/doink-opengraph.png';
    }

    public function ogUrl(): string
    {
        $scheme = $_SERVER['REQUEST_SCHEME'] ?? (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http');
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return $scheme . '://' . $host . '/';
    }

    public function faviconUrl(): string
    {
        return "/resources/favicon.ico";
    }
    
}   