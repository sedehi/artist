<?php

namespace Sedehi\Artist\Http\Controllers;

use Illuminate\Validation\Validator;

class UploadController extends BaseController
{
    public function sectionUpload($section, $model, $id = null)
    {
    }

    public function sectionDelete()
    {
    }

    public function upload()
    {
        $files = request()->file('files');
        if (! is_array($files)) {
            $files = [$files];
        }
        foreach ($files as $file) {
            if ($this->isImage($file)) {
                $validator = Validator::make([
                    'file' => $file,
                ], [
                    'file' => 'required|image|file',
                ]);
                if ($validator->failed()) {
                    dd('ss');
                }
            }
        }
    }

    public function delete()
    {
    }

    private function isImage($file)
    {
        return in_array($file->getClientOriginalExtension(), ['png', 'svg', 'bmp', 'jpeg', 'jpg']);
    }
}
