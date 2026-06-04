import { NextResponse } from 'next/server';
import { subscribeContact } from '@/lib/brevo';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Por favor, proporciona un correo electrónico válido.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'El formato del correo electrónico no es válido.' },
        { status: 400 }
      );
    }

    const result = await subscribeContact(email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Error al procesar la suscripción.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'Te has suscrito con éxito al boletín de El Irónico.'
    });

  } catch (error: any) {
    console.error('API Newsletter Subscribe Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ocurrió un error en el servidor.' },
      { status: 500 }
    );
  }
}
