<?php

namespace Sedehi\Artist\Traits;

use Sedehi\Artist\Fields\Field;
use Sedehi\Artist\Fields\Panel;

trait FilterFields
{
    public function getFieldsForIndex($elements)
    {
        return $this->getFieldsFor($elements,'getShowOnIndex','fieldsForIndex');
    }

    public function getFieldsForCreate($elements)
    {
        return $this->getFieldsFor($elements,'getShowOnCreate','fieldsForCreate');
    }

    public function getPanelsForCreate($elements)
    {
        return $this->getPanelsFor($elements,'getShowOnCreate','fieldsForCreate');
    }

    public function getFieldsForUpdate($elements)
    {
        return $this->getFieldsFor($elements,'getShowOnUpdate','fieldsForUpdate');
    }

    public function getPanelsForUpdate($elements, $model = null)
    {
        return $this->getPanelsFor($elements,'getShowOnUpdate','fieldsForUpdate',$model);
    }

    private function getFieldsFor($elements, $fieldVisibilityMethod, $panelVisibilityMethod)
    {
        $fields = [];
        $panels = [];

        foreach ($elements as $element) {
            if ($element instanceof Field && $element->{$fieldVisibilityMethod}()) {
                $fields[] = $element;
            } elseif ($element instanceof Panel && $element->{$fieldVisibilityMethod}()) {
                $panels[] = $element;
            }
        }

        foreach ($panels as $panel) {
            foreach ($panel->{$panelVisibilityMethod}() as $field) {
                $fields[] = $field;
            }
        }

        return $fields;
    }

    private function getPanelsFor($elements, $fieldVisibilityMethod, $panelVisibilityMethod, $model = null)
    {
        // make default panel
        $defaultPanelFields = array_filter($elements, function ($element) use ($fieldVisibilityMethod) {
            return $element instanceof Field && $element->{$fieldVisibilityMethod}();
        });

        $panels[] = new Panel('default', $defaultPanelFields);

        // make other panels
        $otherPanels = array_filter($elements, function ($element) {
            return $element instanceof Panel;
        });

        foreach ($otherPanels as $panel) {
            $panels[] = new Panel(
                $panel->getLabel(),
                $panel->{$panelVisibilityMethod}()
            );
        }

        // set model on fields
        if ($model !== null) {
            foreach ($panels as $panel) {
                foreach ($panel->getFields() as $field) {
                    $field->model($model);
                }
            }
        }

        return $panels;
    }
}
