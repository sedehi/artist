<x-artist::inputs.text
    :model="$field->getModel()"
    name="{{ $field->getName() }}"
    :field="$field"
    title="{{ $field->getLabel() }}"
/>
