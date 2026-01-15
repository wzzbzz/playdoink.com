<?php

namespace Doink;

class Copy {
    private static $instance = null;
    private $copy = [];
    
    private function __construct() {
        $copyFile = __DIR__ . '/../copy.json';
        if (file_exists($copyFile)) {
            $json = file_get_contents($copyFile);
            $this->copy = json_decode($json, true);
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Get copy by dot notation path
     * Example: Copy::get('homepage.heading') returns "DO!NK"
     */
    public static function get($path, $default = '') {
        $instance = self::getInstance();
        $keys = explode('.', $path);
        $value = $instance->copy;
        
        foreach ($keys as $key) {
            if (!isset($value[$key])) {
                return $default;
            }
            $value = $value[$key];
        }
        
        return $value;
    }
    
    /**
     * Save copy back to file
     */
    public static function save($newCopy) {
        $copyFile = __DIR__ . '/../copy.json';
        $json = json_encode($newCopy, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        return file_put_contents($copyFile, $json) !== false;
    }
    
    /**
     * Get all copy
     */
    public static function all() {
        $instance = self::getInstance();
        return $instance->copy;
    }
}
