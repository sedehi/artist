<x-artist::inputs.select
    :model="$field->getModel()"
    name="{{ $field->getName() }}"
    :field="$field"
    :options="$field->getOptions()"
    title="{{ $field->getLabel() }}"
/>
