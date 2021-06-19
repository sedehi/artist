@if (!$items->isEmpty())
    <span class="fsz-sm">{{ __('artist::artist.pagination.show') }}</span>
    <span class="fsz-sm">{{ $items->firstItem() }} {{ __('artist::artist.pagination.to') }} {{ $items->lastItem() }}</span>
    <span class="fsz-sm">از</span>
    <span class="fsz-sm">{{ $items->total() }} {{ __('artist::artist.pagination.result') }}</span>
@endif
