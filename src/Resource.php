<?php

namespace Sedehi\Artist;

class Resource
{
    public static $indexView = 'artist::resource.index';

    public static $detailView = 'artist::resource.detail';

    public static $createView = 'artist::resource.create';

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
            return $item->getShowOnDetail();
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
