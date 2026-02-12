import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Perfil, UserRole } from '../types';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (mensaje?.tipo === 'success') {
      const timer = setTimeout(() => setMensaje(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const registrarLog = async (accion: string, descripcion: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('actividad').insert([{
          usuario_id: user.id,
          usuario_nombre: user.user_metadata.nombre || 'Admin',
          accion,
          descripcion
        }]);
      }
    } catch (err) {
      console.error("Error al registrar log:", err);
    }
  };

  const fetchUsuarios = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('primer_apellido', { ascending: true });
    
    if (!error) {
      setUsuarios(data || []);
    } else {
      setMensaje({ texto: 'Error al conectar con la base de datos', tipo: 'error' });
    }
    setFetching(false);
  };

  // --- REGISTRAR USUARIO (CORREGIDO) ---
  const registrarUsuario = async (formData: any) => {
    setLoading(true);
    setMensaje(null);
    try {
      // 1. Registro en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
          data: { 
            nombre: formData.nombre, 
            rol: formData.rol 
          } 
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // 2. Actualizar el perfil (Usando snake_case exacto de tu DB)
      const { error: profileError } = await supabase
        .from('perfiles')
        .update({
          nombre: formData.nombre,
          segundo_nombre: formData.segundo_nombre || null,
          primer_apellido: formData.primer_apellido,
          segundo_apellido: formData.segundo_apellido || null,
          fecha_nacimiento: formData.fecha_nacimiento || null,
          telefono: formData.telefono || null,
          tipo_documento: formData.tipo_documento,
          numero_documento: formData.numero_documento,
          grupo_sanguineo: formData.grupo_sanguineo,
          factor_rh: formData.factor_rh,
          eps: formData.eps || null,
          rol: formData.rol
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      await registrarLog('REGISTRO_STAFF', `Se registró a ${formData.primer_apellido} con rol ${formData.rol}`);
      setMensaje({ texto: `¡${formData.nombre} registrado correctamente!`, tipo: 'success' });
      
      await fetchUsuarios();
      return true;
    } catch (err: any) {
      setMensaje({ texto: err.message || 'Error en el registro', tipo: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- ACTUALIZAR USUARIO (CORREGIDO Y LIMPIO) ---
  const actualizarUsuario = async (usuario: Perfil) => {
    setLoading(true);
    try {
      // IMPORTANTE: Solo enviamos campos que existen en la tabla 'perfiles'
      // Eliminamos campos como 'email', 'updated_at' o 'created_at' si los tuviera el objeto
      const { error } = await supabase
        .from('perfiles')
        .update({
          nombre: usuario.nombre,
          segundo_nombre: usuario.segundo_nombre || null,
          primer_apellido: usuario.primer_apellido,
          segundo_apellido: usuario.segundo_apellido || null,
          tipo_documento: usuario.tipo_documento,
          numero_documento: usuario.numero_documento,
          grupo_sanguineo: usuario.grupo_sanguineo,
          factor_rh: usuario.factor_rh,
          eps: usuario.eps || null,
          telefono: usuario.telefono || null,
          rol: usuario.rol,
          fecha_nacimiento: usuario.fecha_nacimiento || null
        })
        .eq('id', usuario.id);

      if (error) throw error;

      await registrarLog('ACTUALIZACION_STAFF', `Editado: ${usuario.primer_apellido}`);
      setMensaje({ texto: 'Perfil actualizado correctamente', tipo: 'success' });
      
      await fetchUsuarios();
      return true;
    } catch (err: any) {
      console.error("Error completo de Supabase:", err);
      setMensaje({ texto: 'Error: ' + err.message, tipo: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${nombre}?`)) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('perfiles').delete().eq('id', id);
      if (error) throw error;
      await registrarLog('ELIMINACION', `Eliminado: ${nombre}`);
      setMensaje({ texto: 'Usuario eliminado', tipo: 'success' });
      await fetchUsuarios();
    } catch (err: any) {
      setMensaje({ texto: 'Error al eliminar', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    const defaultPass = "Cezeus2026*";
    if (confirm(`¿Restablecer clave de ${email}?`)) {
      alert("La clave temporal será: " + defaultPass);
      await registrarLog('RESET_PASS', `Reinicio de credenciales para ${email}`);
    }
  };

  return {
    usuarios,
    loading,
    fetching,
    mensaje,
    setMensaje,
    registrarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    resetPassword,
    refrescar: fetchUsuarios
  };
};