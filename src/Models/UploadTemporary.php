<?php

namespace Sedehi\Artist\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;
use Sedehi\Artist\Traits\UUIDs;

class UploadTemporary extends Model
{
    use UUIDs;
    public $table = 'upload_temporary';
    public $fillable = ['name','path'];

    public function getFullPathAttribute(){
        return rtrim($this->path,'/').'/'.$this->name;
    }

    public function remove()
    {
        if(File::exists($this->full_path)){
            File::delete($this->full_path);
            $this->delete();
        }
    }
}
