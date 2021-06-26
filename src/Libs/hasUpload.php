<?php

namespace Sedehi\Artist\Libs;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Sedehi\Artist\Models\UploadTemporary;

trait hasUpload
{
    public $disk = null;

    public $dimensions = [];

    public $keepLargeSize = true;

    public $keepOriginal = false;

    public function uploadPath()
    {
        return 'users/'.$this->created_at->format('Y-m-d');
    }

    public function moveFile($fieldName, $tempId)
    {
        $temp = UploadTemporary::where('id', $tempId)->frist();

        if ($this->isImage($temp->name)) {
            $image = ImageMaker::make($temp->full_path)
                ->disk($this->disk)
                ->path($this->uploadPath())
                ->dimensions($this->dimensions)
                ->name($temp->name);

            if ($this->keepLargeSize) {
                $image = $image->keepLargeSize();
            }

            if ($this->keepOriginal) {
                $image = $image->keepOriginal();
            }
            $image->store();
        } else {
            Storage::disk($this->disk)->move($temp->full_path, rtrim($this->uploadPath()).'/'.$this->{$fieldName});
        }

        $this->{$fieldName} = $temp->name;
        $this->save();

        $temp->remove();
    }

    public function removeFile($fieldName)
    {
        if ($this->isImage($fieldName)) {
            ImageMaker::make()->path($this->uploadPath())->name($this->{$fieldName})->remove();
        } else {
            Storage::disk($this->disk)->delete(rtrim($this->uploadPath()).'/'.$this->{$fieldName});
        }
    }

    private function isImage($fileName)
    {
        return in_array(File::extension($fileName), ['png', 'svg', 'bmp', 'jpeg', 'jpg']);
    }
}
