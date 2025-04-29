import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fileToUrl',
    standalone: true
})
export class FileToUrlPipe implements PipeTransform {
    private urls = new Map<File, string>();

    transform(file: File): string {
        if (!file) {
            return '';
        }
        
        if (this.urls.has(file)) {
            return this.urls.get(file) as string;
        }
        
        const url = URL.createObjectURL(file);
        this.urls.set(file, url);
        
        return url;
    }

    ngOnDestroy() {
        this.urls.forEach(url => URL.revokeObjectURL(url));
        this.urls.clear();
    }
}