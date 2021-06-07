@if (!$items->isEmpty())
    <span>&nbsp;&nbsp;&nbsp;</span>
    <span class="fsz-sm">{{ __('admin.show') }}</span>
    <span class="fsz-sm">{{ $items->firstItem() }} {{ __('admin.to') }} {{ $items->lastItem() }}</span>
    <span class="fsz-sm">از</span>
    <span class="fsz-sm">{{ $items->total() }} {{ __('admin.result') }}</span>
@endif
