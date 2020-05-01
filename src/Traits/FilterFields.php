<?php

namespace Sedehi\Artist\Traits;

use Sedehi\Artist\Fields\Field;
use Sedehi\Artist\Fields\Panel;

trait FilterFields
{
    public function getFieldsForIndex($elements)
    {
        $fields = [];
        $panels = [];

        foreach ($elements as $element) {
            if ($element instanceof Field && $element->getShowOnIndex()) {
                $fields[] = $element;
            } elseif ($element instanceof Panel && $element->getShowOnIndex()) {
                $panels[] = $element;
            }
        }

        foreach ($panels as $panel) {
            foreach ($panel->fieldsForIndex() as $field) {
                $fields[] = $field;
            }
        }

        return $fields;
    }

    public function getFieldsForCreate($elements)
    {
        $fields = [];
        $panels = [];

        foreach ($elements as $element) {
            if ($element instanceof Field && $element->getShowOnCreate()) {
                $fields[] = $element;
            } elseif ($element instanceof Panel && $element->getShowOnCreate()) {
                $panels[] = $element;
            }
        }

        foreach ($panels as $panel) {
            foreach ($panel->fieldsForCreate() as $field) {
                $fields[] = $field;
            }
        }

        return $fields;
    }

    public function getPanelsForCreate($elements)
    {
        // make default panel
        $defaultPanelFields = array_filter($elements, function ($element) {
            return $element instanceof Field && $element->getShowOnCreate();
        });

        $panels[] = new Panel('default', $defaultPanelFields);

        // make other panels
        $otherPanels = array_filter($elements, function ($element) {
            return $element instanceof Panel;
        });

        foreach ($otherPanels as $panel) {
            $panels[] = new Panel(
                $panel->getLabel(),
                $panel->fieldsForCreate()
            );
        }

        return $panels;
    }
}
