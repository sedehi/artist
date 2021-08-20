<?php

namespace Sedehi\Artist\Traits;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Sedehi\Artist\Models\UploadTemporary;
use Sedehi\Artist\Libs\ImageMaker;

trait HasUpload
{
    public function getFullPath($methodName)
    {
        $options = $this->{$methodName}();

        return rtrim($options->path, '/').'/'.Arr::get($this, $options->field);
    }

    public function saveFile($tempId, $methodName)
    {
        $options = $this->{$methodName}();
        if (is_array($tempId)) {
            $tempId = head($tempId);
        }
        $temp = UploadTemporary::where('id', $tempId)->first();
        $fileName = $temp->name;
        if ($this->isImage($fileName)) {
            $image = ImageMaker::make($temp->full_path)
                ->disk($options->disk)
                ->path($options->path)
                ->dimensions($options->dimensions)
                ->name($fileName);

            if ($options->keepLargeSize) {
                $image = $image->keepLargeSize();
            }

            if ($options->keepOriginal) {
                $image = $image->keepOriginal();
            }
            $image->store();
        } else {
            File::move($temp->full_path, Storage::disk($options->disk)->path(rtrim($options->path, '/').'/'.$fileName));
        }
        $temp->remove();

        return $fileName;
    }

    public function removeFile($methodName)
    {
        $options = $this->{$methodName}();

        if (str_contains($options->field, '.')) {
            $fileName = Arr::get($this, $options->field);
        } else {
            $fileName = $this->{$options->field};
        }

        if ($this->isImage($fileName)) {
            ImageMaker::make()->path($options->path)->disk($options->disk)->name($fileName)->remove();
        } else {
            Storage::disk($options->disk)->delete(rtrim($options->path).'/'.Arr::get($this, $options->field));
        }
    }

    private function isImage($fileName)
    {
        return in_array(File::extension($fileName), ['png', 'svg', 'bmp', 'jpeg', 'jpg']);
    }
}
