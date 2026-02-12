import { supabase } from './supabase';

/**
 * Registra un evento de auditoría en la tabla 'actividad'
 * @param accion - Categoría del evento (ej: 'REGISTRO_ALUMNO')
 * @param descripcion - Detalle de lo que ocurrió
 */
export const registrarLog = async (accion: string, descripcion: string) => {
  try {
    // Obtenemos el usuario que está realizando la acción actualmente
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase.from('actividad').insert([{
      usuario_id: user.id,
      usuario_nombre: user.user_metadata.nombre || 'Administrador',
      accion: accion,
      descripcion: descripcion
    }]);

    if (error) throw error;
  } catch (err) {
    console.error("Error al registrar el log de actividad:", err);
  }
};