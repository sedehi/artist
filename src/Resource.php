<?php

namespace Sedehi\Artist;

class Resource
{
    public static $indexView = 'artist::resource.index';

    public static $perPage = 15;

    public function fields()
    {
        return [];
    }

    public function fieldsForIndex()
    {
        return array_filter($this->fields(), function ($item) {
            return $item->getShowOnIndex();
        });
    }

    public function fieldsForDetail()
    {
        return array_filter($this->fields(), function ($item) {
            return $item->getShowOnDetails();
        });
    }

    public function fieldsForCreate()
    {
        return array_filter($this->fields(), function ($item) {
            return $item->getShowOnCreate();
        });
    }

    public function fieldsForUpdate()
    {
        return array_filter($this->fields(), function ($item) {
            return $item->getShowOnUpdate();
        });
    }
}
