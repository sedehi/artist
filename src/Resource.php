<?php

namespace Sedehi\Artist;

use Sedehi\Artist\Fields\Field;

class Resource
{
    public static $indexView = 'artist::resource.index';

    public static $detailView = 'artist::resource.detail';

    public static $createView = 'artist::resource.create';

    public static $editView = 'artist::resource.edit';

    public static $perPage = 15;

    protected $resource;

    public function resource($resource)
    {
        $this->resource = $resource;

        return $this;
    }

    public function fields()
    {
        return [];
    }

    public function fieldsForIndex()
    {
        return array_map(function ($value) {
            return $value->model($this->resource);
        }, array_filter($this->fields(), function ($item) {
            return $item->getShowOnIndex();
        }));
    }

    public function fieldsForDetail()
    {
        return array_map(function ($value) {
            return $value->model($this->resource);
        }, array_filter($this->fields(), function ($item) {
            return $item->getShowOnDetail();
        }));
    }

    public function fieldsForCreate()
    {
        return array_filter($this->fields(), function ($item) {
            return $item->getShowOnCreate();
        });
    }

    public function fieldsForUpdate()
    {
        return array_map(function ($value) {
            return $value->model($this->resource);
        }, array_filter($this->fields(), function ($item) {
            return $item->getShowOnUpdate();
        }));
    }

    public function fieldsForSearch()
    {
        return array_filter($this->fields(), function ($item) {
            return $item instanceof Field && $item->getSearchRules();
        });
    }

    public static function name()
    {
        return class_basename(get_called_class());
    }
}
