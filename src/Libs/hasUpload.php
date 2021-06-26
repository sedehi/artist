<?php

namespace Sedehi\Artist\Libs;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Sedehi\Artist\Models\UploadTemporary;

trait hasUpload
{

    public function uploadPath()
    {
        return 'users/'.$this->created_at->format('Y-m-d');
    }

    public function getFullPath($field){
        return rtrim($this->uploadPath(),'/').'/'.$this->{$field};
    }

    public function saveFile($tempId)
    {
        if(is_array($tempId)){
            $tempId = head($tempId);
        }
        $temp = UploadTemporary::where('id', $tempId)->first();
        $fileName = $temp->name;
        if ($this->isImage($fileName)) {
            $image = ImageMaker::make($temp->full_path)
                ->disk($this->disk)
                ->path($this->uploadPath())
                ->dimensions($this->dimensions)
                ->name($fileName);

            if ($this->keepLargeSize) {
                $image = $image->keepLargeSize();
            }

            if ($this->keepOriginal) {
                $image = $image->keepOriginal();
            }
            $image->store();
        } else {
            File::move($temp->full_path,Storage::disk($this->disk)->path(rtrim($this->uploadPath(),'/').'/'.$fileName));
        }
        $temp->remove();
        return $fileName;
    }

    public function removeFile($fieldName)
    {
        if ($this->isImage($this->{$fieldName})) {
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
