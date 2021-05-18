<?php

namespace Sedehi\Artist;

class Menu
{
    private $link;
    private $attributes;
    private $childs;

    public static function make()
    {
        return new self;
    }

    public function link($link)
    {
        $this->link = $link;

        return $this;
    }

    public function attributes(array $attributes)
    {
        $this->attributes = $attributes;

        return $this;
    }

    public function childs($item)
    {
        if (! is_array($item)) {
            $item = [$item];
        }

        return $this;
    }

    public function render()
    {
    }
}
