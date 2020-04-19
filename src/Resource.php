<?php

namespace Sedehi\Artist;

class Resource
{
    public static $indexView = 'artist::resource.index';

    public static $perPage = 15;

    public function fields()
    {
    }

    public function fieldsForIndex()
    {
        return dd(array_filter($this->fields(),function ($item){
            return $item->showOnIndex;
        }));

    }
}
