import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

/**
 * Clase de utilidad para mostrar alertas usando SweetAlert2
 */
export class SweetAlert {
  /**
   * Muestra una alerta de éxito
   * @param title Título de la alerta
   * @param text Texto opcional de la alerta
   * @returns Promesa con el resultado de la alerta
   */
  static success(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6',
    });
  }

  /**
   * Muestra una alerta de error
   * @param title Título de la alerta
   * @param text Texto opcional de la alerta
   * @returns Promesa con el resultado de la alerta
   */
  static error(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#d33',
    });
  }

  /**
   * Muestra una alerta de advertencia
   * @param title Título de la alerta
   * @param text Texto opcional de la alerta
   * @returns Promesa con el resultado de la alerta
   */
  static warning(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#f8bb86',
    });
  }

  /**
   * Muestra una alerta informativa
   * @param title Título de la alerta
   * @param text Texto opcional de la alerta
   * @returns Promesa con el resultado de la alerta
   */
  static info(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3fc3ee',
    });
  }

  /**
   * Muestra una alerta de confirmación
   * @param title Título de la alerta
   * @param text Texto de la alerta
   * @param confirmButtonText Texto del botón de confirmación
   * @param cancelButtonText Texto del botón de cancelación
   * @returns Promesa con el resultado de la alerta
   */
  static confirm(
    {
      title,
      text,
      confirmButtonText,
      cancelButtonText
    }: {
      title: string;
      text: string;
      confirmButtonText: string;
      cancelButtonText: string;
    }
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText,
      cancelButtonText,
    });
  }

  /**
   * Muestra un toast (notificación pequeña)
   * @param title Título del toast
   * @param icon Icono del toast
   * @param position Posición del toast
   * @param timer Tiempo en milisegundos que se mostrará el toast
   */
  static toast(
    title: string,
    icon: SweetAlertIcon = 'success',
    position: 'top' | 'top-start' | 'top-end' | 'center' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end',
    timer: number = 3000
  ): void {
    const Toast = Swal.mixin({
      toast: true,
      position,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon,
      title,
    });
  }

  /**
   * Muestra una alerta con un input para que el usuario ingrese datos
   * @param title Título de la alerta
   * @param inputPlaceholder Placeholder del input
   * @param inputValue Valor inicial del input
   * @returns Promesa con el resultado de la alerta
   */
  static input(
    title: string,
    inputPlaceholder: string = '',
    inputValue: string = ''
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      input: 'text',
      inputPlaceholder,
      inputValue,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });
  }
}
