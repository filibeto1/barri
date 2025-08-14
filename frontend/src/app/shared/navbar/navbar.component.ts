import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule, NavigationEnd, NavigationError, NavigationStart, RoutesRecognized, NavigationCancel } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { filter } from 'rxjs/operators';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatDividerModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
        MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  private userSub: Subscription;
  private routerSub: Subscription;
currentTitle = 'Mi aplicación';
  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.userSub = this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
      
      console.log('=== NAVBAR DEBUG ===');
      console.log('Usuario actual:', user);
      console.log('Es admin?:', this.isAdmin);
      console.log('Token:', this.authService.getToken());
      console.log('IsAuthenticated:', this.authService.isAuthenticated);
      console.log('IsAdmin desde servicio:', this.authService.isAdmin);
      console.log('Auth inicializado:', this.authService.authInitialized);
      console.log('==================');
    });

    // Suscripción COMPLETA a eventos de navegación para diagnóstico
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('🟡 NavigationStart:', event.url);
        console.log('   - Triggered by:', event.navigationTrigger);
        console.log('   - Restore state:', event.restoredState);
      } else if (event instanceof RoutesRecognized) {
        console.log('🟦 RoutesRecognized:', event.url);
        console.log('   - State:', event.state);
      } else if (event instanceof NavigationEnd) {
        console.log('✅ NavigationEnd:', event.url);
        console.log('   - URL después de navegación:', event.urlAfterRedirects);
        
        // Verificar si hubo redirección inesperada
        if (event.url !== event.urlAfterRedirects) {
          console.warn('⚠️  REDIRECCIÓN DETECTADA:');
          console.warn('   - URL solicitada:', event.url);
          console.warn('   - URL final:', event.urlAfterRedirects);
        }
      } else if (event instanceof NavigationCancel) {
        console.log('🟠 NavigationCancel:', event.url);
        console.log('   - Razón:', event.reason);
      } else if (event instanceof NavigationError) {
        console.error('❌ NavigationError:', event.url);
        console.error('   - Error:', event.error);
        
        // Si el error es relacionado con guards
        if (event.error?.toString().includes('guard')) {
          console.error('   - Posible problema con guard');
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  // Método mejorado para navegar con debug completo
  navegarConDebug(ruta: string): void {
    
  console.debug('Navegando a', ruta);
  this.router.navigate([ruta]);
    
    // Estado pre-navegación
    console.log('📊 Estado pre-navegación:', {
      isLoggedIn: this.isLoggedIn,
      isAdmin: this.isAdmin,
      isAuthenticated: this.authService.isAuthenticated,
      authInitialized: this.authService.authInitialized,
      currentUser: this.authService.currentUserValue,
      currentUrl: this.router.url,
      token: !!this.authService.getToken()
    });

    // Verificar si la ruta existe
    const rutaExiste = this.verificarRutaExiste(ruta);
    console.log('🔍 ¿Ruta existe?:', rutaExiste);

    if (!rutaExiste) {
      console.error('❌ LA RUTA NO EXISTE:', ruta);
      console.log('📋 Rutas disponibles:', this.listarRutasDisponibles());
      return;
    }

const token = this.authService.getToken();
const user = this.authService.currentUserValue;

if (!token || !user) {
  console.error('❌ Usuario no autenticado - Token o usuario faltante');
  this.router.navigate(['/login']);
  return;
}


    // Si es ruta admin, verificar permisos
    if (ruta.startsWith('/admin') && !this.authService.isAdmin) {
      console.error('❌ Usuario sin permisos de admin - No se puede navegar');
      return;
    }

    console.log('🚀 Ejecutando navegación...');
    
    // Usar navigateByUrl y monitorear resultado
    this.router.navigateByUrl(ruta).then(success => {
      console.log(`✅ Resultado navegación a ${ruta}:`, success);
      
      if (!success) {
        console.error('❌ Navegación falló');
        this.debugPostNavegacionFallida(ruta);
      }
      
    }).catch(error => {
      console.error('❌ Error durante navegación:', error);
      this.debugPostNavegacionFallida(ruta);
    });
  }

  // Verificar si una ruta existe en la configuración
  private verificarRutaExiste(ruta: string): boolean {
    const rutaLimpia = ruta.startsWith('/') ? ruta.substring(1) : ruta;
    const partes = rutaLimpia.split('/');
    
    return this.buscarRutaRecursiva(this.router.config, partes, 0);
  }

  private buscarRutaRecursiva(rutas: any[], partes: string[], indice: number): boolean {
    if (indice >= partes.length) return true;
    
    const parteActual = partes[indice];
    const rutaEncontrada = rutas.find(r => r.path === parteActual || r.path === '**');
    
    if (!rutaEncontrada) return false;
    
    if (indice === partes.length - 1) return true;
    
    if (rutaEncontrada.children) {
      return this.buscarRutaRecursiva(rutaEncontrada.children, partes, indice + 1);
    }
    
    return false;
  }

  // Listar todas las rutas disponibles
  private listarRutasDisponibles(): string[] {
    const rutas: string[] = [];
    this.extraerRutasRecursiva(this.router.config, '', rutas);
    return rutas;
  }

  private extraerRutasRecursiva(rutas: any[], prefijo: string, lista: string[]): void {
    rutas.forEach(ruta => {
      if (ruta.path && ruta.path !== '**') {
        const rutaCompleta = prefijo ? `${prefijo}/${ruta.path}` : ruta.path;
        lista.push(rutaCompleta);
        
        if (ruta.children) {
          this.extraerRutasRecursiva(ruta.children, rutaCompleta, lista);
        }
      }
    });
  }

  private debugPostNavegacionFallida(rutaIntentada: string): void {
    console.log('=== DEBUG POST-NAVEGACIÓN FALLIDA ===');
    console.log('Ruta intentada:', rutaIntentada);
    console.log('URL actual:', this.router.url);
    console.log('Estado del router:', this.router.routerState);
    
    // Verificar guards activos
    console.log('🛡️ Verificando guards...');
    const rutaActual = this.router.routerState.snapshot.root;
    this.debugRutaActual(rutaActual);
    
    console.log('================================');
  }

  private debugRutaActual(rutaSnapshot: any, nivel: number = 0): void {
    const indent = '  '.repeat(nivel);
    console.log(`${indent}Ruta:`, rutaSnapshot.routeConfig?.path || 'root');
    console.log(`${indent}Guards:`, rutaSnapshot.routeConfig?.canActivate || 'ninguno');
    console.log(`${indent}Component:`, rutaSnapshot.routeConfig?.component?.name || rutaSnapshot.routeConfig?.loadComponent || 'ninguno');
    
    if (rutaSnapshot.children) {
      rutaSnapshot.children.forEach((child: any) => {
        this.debugRutaActual(child, nivel + 1);
      });
    }
  }

 navegarAMiembros(): void {
  this.navegarConDebug('/admin/members');
}

navegarAInstructores(): void {
  this.navegarConDebug('/admin/instructores');
}
async navegarAClases(): Promise<void> {
  console.group('🚀 Navegación a /admin/classes');
  
  try {
    // 1. Verificar autenticación inicializada
    if (!this.authService.authInitialized) {
      console.log('🔍 Inicializando autenticación...');
      const initialized = await this.authService.initialize();
      if (!initialized) {
        throw new Error('No se pudo inicializar la autenticación');
      }
    }

    // 2. Verificar token
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No hay token disponible');
    }

    // 3. Verificar token expirado
    if (this.authService.isTokenExpired(token)) {
      console.log('🔄 Token expirado, intentando renovar...');
      try {
        await this.authService.refreshToken().toPromise();
      } catch (error) {
        throw new Error('No se pudo renovar el token');
      }
    }

    // 4. Verificar usuario autenticado
    if (!this.authService.isAuthenticated) {
      throw new Error('Usuario no autenticado');
    }

    // 5. Verificar rol de admin
    if (!this.authService.isAdmin) {
      throw new Error('Usuario no es admin');
    }

    // 6. Navegar
    console.log('🔄 Navegando...');
    const success = await this.router.navigate(['/admin/classes']);
    if (!success) {
      throw new Error('La navegación falló');
    }

    console.log('✅ Navegación exitosa');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Error desconocido');
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: '/admin/classes' }
    });
  } finally {
    console.groupEnd();
  }
}

navegarAPagos(): void {
  this.navegarConDebug('/admin/payments');
}

navegarAInformes(): void {
  this.navegarConDebug('/admin/listar-instructores'); 
}
navegarACrearInstructor(): void {
  this.navegarConDebug('/admin/crear-instructor');
}


  // Método para debug manual desde el template
  debugRutas(): void {
    console.log('=== DEBUG MANUAL DE RUTAS ===');
    console.log('Configuración completa:', this.router.config);
    console.log('Rutas disponibles:', this.listarRutasDisponibles());
    console.log('URL actual:', this.router.url);
    console.log('Estado de autenticación:', {
      isAuthenticated: this.authService.isAuthenticated,
      isAdmin: this.authService.isAdmin,
      user: this.authService.currentUserValue
    });
    console.log('=============================');
  }

  logout(): void {
    console.log('Cerrando sesión...');
    this.authService.logout();
  }
}