<?php
// Draws the "can you beat my N on DO!NK?" share image on the server (600x315 PNG), same layout as the
// in-browser canvas version. Server-drawn so nobody can upload their own picture as a score image.
// Needs PHP's GD extension with FreeType. Font: Luckiest Guy (Apache 2.0), resources/fonts/.
class ScoreImage
{
    const FONT = __DIR__ . '/../resources/fonts/LuckiestGuy-Regular.ttf';

    public static function available(): bool
    {
        return function_exists('imagettftext') && is_readable(self::FONT);
    }

    // $name: list of [text, "#rrggbb"] pieces for the game name, e.g. [["MEGA","#2b8bf6"],["DO!NK","#000000"]]
    public static function png(int $score, array $name): string
    {
        $w = 600; $h = 315;
        $im = imagecreatetruecolor($w, $h);
        imagefill($im, 0, 0, self::color($im, '#ffffff'));
        $pt = fn($px) => $px * 0.75;   // canvas px -> GD points (96 dpi)

        self::centered($im, $pt(50), 80, 'can you beat my', '#000000');
        self::centered($im, $pt(140), 200, (string)$score, '#4CAF50');

        // "on [NAME] ?" with a blue box around the name
        $size = $pt(50); $y = 280; $pad = 10;
        $on = 'on '; $q = '?';
        $nameW = 0; foreach ($name as [$t]) $nameW += self::width($size, $t);
        $total = self::width($size, $on) + $pad + $nameW + $pad + 10 + self::width($size, $q);
        $x = (int)round(($w - $total) / 2);
        $x = self::text($im, $size, $x, $y, $on, '#000000');
        $box = imagettfbbox($size, 0, self::FONT, implode('', array_column($name, 0)));
        $top = $y + min($box[5], $box[7]) - $pad; $bottom = $y + max($box[1], $box[3]) + $pad;
        imagesetthickness($im, 2);
        imagerectangle($im, $x, $top, $x + $nameW + $pad * 2, $bottom, self::color($im, '#2b8bf6'));
        $x += $pad;
        foreach ($name as [$t, $c]) $x = self::text($im, $size, $x, $y, $t, $c);
        self::text($im, $size, $x + $pad + 10, $y, $q, '#000000');

        ob_start(); imagepng($im); imagedestroy($im);
        return ob_get_clean();
    }

    private static function color($im, string $hex): int
    {
        return imagecolorallocate($im, hexdec(substr($hex, 1, 2)), hexdec(substr($hex, 3, 2)), hexdec(substr($hex, 5, 2)));
    }
    private static function width(float $size, string $t): int
    {
        $b = imagettfbbox($size, 0, self::FONT, $t);
        return max($b[2], $b[4]) - min($b[0], $b[6]);
    }
    private static function text($im, float $size, int $x, int $y, string $t, string $hex): int
    {
        imagettftext($im, $size, 0, $x, $y, self::color($im, $hex), self::FONT, $t);
        return $x + self::width($size, $t);
    }
    private static function centered($im, float $size, int $y, string $t, string $hex): void
    {
        self::text($im, $size, (int)round((600 - self::width($size, $t)) / 2), $y, $t, $hex);
    }
}
