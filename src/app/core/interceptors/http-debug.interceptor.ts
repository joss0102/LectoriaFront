import { HttpInterceptorFn, HttpRequest, HttpEvent, HttpHandlerFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';

export const httpDebugInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>, 
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    console.log(`🔄 Enviando solicitud a ${req.url}`, {
    method: req.method,
    url: req.url,
    headers: req.headers.keys().map(key => ({ [key]: req.headers.get(key) })),
    body: req.body
    });

    return next(req).pipe(
        tap(event => {
        if (event instanceof HttpResponse) {
            console.log(`✅ Respuesta de ${req.url}`, {
            status: event.status,
            statusText: event.statusText,
            headers: event.headers.keys().map(key => ({ [key]: event.headers.get(key) })),
            body: event.body
            });
        }
        }),
        catchError((error: HttpErrorResponse) => {
        console.error(`❌ Error en solicitud a ${req.url}`, {
            error: error,
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            responseBody: error.error
        });
        
        if (error.error instanceof Blob && error.error.type.includes('text/html')) {
            const reader = new FileReader();
            reader.onload = () => {
            console.error('Contenido del Blob de error:', reader.result);
            };
            reader.readAsText(error.error);
        }
        
        return throwError(() => error);
        })
    );
};