<?php

namespace Sedehi\Artist;

use Sedehi\Artist\Fields\Field;
use Sedehi\Artist\Fields\Panel;

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
        $fields = array_filter($this->fields(), function ($field) {
            return $field instanceof Field && $field->getShowOnCreate();
        });

        $panels = array_filter($this->fields(), function ($field) {
            return $field instanceof Panel;
        });

        foreach ($panels as $panel) {
            foreach ($panel->fieldsForCreate() as $field) {
                $fields[] = $field;
            }
        }

        return $fields;
    }

    public function panelsForCreate()
    {
        // make default panel
        $defaultPanelFields = array_filter($this->fields(), function ($field) {
            return $field instanceof Field && $field->getShowOnCreate();
        });

        $panels[] = new Panel('default', $defaultPanelFields);

        // make other panels
        $otherPanels = array_filter($this->fields(), function ($field) {
            return $field instanceof Panel;
        });

        foreach ($otherPanels as $panel) {
            $panels[] = new Panel(
                $panel->getLabel(),
                $panel->fieldsForCreate()
            );
        }

        return $panels;
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
            return $item->getSearchRules();
        });
    }

    public static function name()
    {
        return class_basename(get_called_class());
    }
}
