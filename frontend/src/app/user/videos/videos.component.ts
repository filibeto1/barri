  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { HttpClient, HttpClientModule,HttpParams  } from '@angular/common/http';
  import { FormsModule } from '@angular/forms';
  import { MatButtonModule } from '@angular/material/button';
  import { MatInputModule } from '@angular/material/input';
  import { MatCardModule } from '@angular/material/card';
  import { MatTabsModule } from '@angular/material/tabs';
  import { MatIconModule } from '@angular/material/icon';
  import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
  import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

  @Component({
    selector: 'app-videos',
    standalone: true,
    imports: [
      CommonModule, 
      HttpClientModule, 
      FormsModule,
      MatButtonModule,
      MatInputModule,
      MatCardModule,
      MatTabsModule,
      MatIconModule,
      MatProgressSpinnerModule
    ],
    templateUrl: './videos.component.html',
    styleUrls: ['./videos.component.css']
  })
  export class VideosComponent implements OnInit {
    // Listas de reproducción con estado de carga
    playlists = [
      { 
        id: 'PLoucxhYESH36wKAk3jd4io_AXPZBU2z4N', 
        title: 'Pierna', 
        icon: 'directions_run',
        videos: [] as any[],
        loading: false,
        error: false
      },
      { 
        id: 'PLoucxhYESH37rXXAoEK755Sd3y1hS-3R5', 
        title: 'Hombro', 
        icon: 'fitness_center',
        videos: [],
        loading: false,
        error: false
      },
      { 
        id: 'PLoucxhYESH37_VEWphLkJ_MTarso9zjJK', 
        title: 'Espalda', 
        icon: 'accessibility',
        videos: [],
        loading: false,
        error: false
      },
      { 
        id: 'PLoucxhYESH36_BC2HrEtsui01-Y06mgBn', 
        title: 'Brazos', 
        icon: 'sports_handball',
        videos: [],
        loading: false,
        error: false
      },
      { 
        id: 'PLoucxhYESH34j3hHL43cF3KsQeWeYOthp', 
        title: 'Pecho', 
        icon: 'self_improvement',
        videos: [],
        loading: false,
        error: false
      },
      { 
        id: 'PLoucxhYESH35vuPFldEVOcTJcUYRQANjD', 
        title: 'Abdomen', 
        icon: 'airline_seat_individual_suite',
        videos: [],
        loading: false,
        error: false
      }
    ];

    searchQuery = '';
    searchResults: any[] = [];
    selectedVideo: any = null;
    loadingSearch = false;
    errorMessage = '';


    readonly API_KEY = 'AIzaSyDxNS3RPLBT2uMFD-0Lpt7RQvmJCwTR-00';

    constructor(
      private http: HttpClient,
      private sanitizer: DomSanitizer
    ) {}

    ngOnInit() {
      this.loadAllPlaylists();
    }

    loadAllPlaylists() {
      this.playlists.forEach(playlist => {
        this.loadPlaylistVideos(playlist);
      });
    }

readonly API_URL = environment.apiUrl || 'http://localhost:5000/api';
isMockDataWarningVisible = false;
  private displayMockDataWarning() {
    this.isMockDataWarningVisible = true;
    setTimeout(() => this.isMockDataWarningVisible = false, 5000);
  }

private async loadPlaylistVideos(playlist: any) {
  if (playlist.videos.length > 0 || playlist.loading) return;

  playlist.loading = true;
  playlist.error = null;
  
  try {
    const response: any = await this.http.get(
      `${this.API_URL}/youtube/playlistItems`,
      { 
        params: new HttpParams()
          .set('playlistId', playlist.id)
          .set('part', 'snippet')
          .set('maxResults', '20'),
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        })
      }
    ).toPromise();

    playlist.videos = this.processVideoResponse(response.items);
    
  } catch (error: any) {
    console.error('Error al cargar videos:', {
      error,
      playlistId: playlist.id
    });
    
    playlist.error = this.handleYoutubeError(error);
    
    // Datos mock para desarrollo
    if (!environment.production) {
      playlist.videos = this.getMockVideos();
this.displayMockDataWarning();
    }
  } finally {
    playlist.loading = false;
  }
}

private processVideoResponse(items: any[]): any[] {
  return items
    .filter(item => item?.snippet)
    .map(item => ({
      id: item.snippet.resourceId?.videoId,
      snippet: {
        title: item.snippet.title || 'Título no disponible',
        description: item.snippet.description || '',
        thumbnails: item.snippet.thumbnails || {},
        channelTitle: item.snippet.channelTitle || 'Canal desconocido',
        publishedAt: item.snippet.publishedAt || ''
      }
    }));
}

private handleYoutubeError(error: any): string {
  console.error('Detalles del error:', {
    status: error.status,
    url: error.url,
    message: error.message,
    errorDetails: error.error
  });

  if (error.status === 403) {
    return error.error?.error?.message || 'Acceso denegado. Verifica la configuración de la API.';
  } else if (error.status === 401) {
    return 'Error de autenticación. Verifica tu clave API.';
  } else if (error.status === 404) {
    return 'No se encontró la lista de reproducción.';
  }
  
  return 'Error al cargar los videos. Intenta nuevamente más tarde.';
}

private getMockVideos() {
  return [
    {
      id: 'dQw4w9WgXcQ',
      snippet: {
        title: 'Video de ejemplo (modo desarrollo)',
        description: 'Este es un video de prueba porque la API no está disponible',
        thumbnails: {
          default: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg' },
          medium: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
          high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' }
        },
        channelTitle: 'Canal de prueba',
        publishedAt: new Date().toISOString()
      }
    }
  ];
}

private async tryAlternativeRequest(playlist: any) {
    try {
      // Intenta con una URL que incluya el origen
      const url = `${this.API_URL}/playlistItems?part=snippet&maxResults=20&playlistId=${playlist.id}&key=${this.API_KEY}&origin=http://localhost:4200`;
      const response: any = await this.http.get(url).toPromise();
      playlist.videos = response.items.map((item: any) => ({
        id: item.snippet?.resourceId?.videoId,
        title: item.snippet?.title,
        thumbnail: item.snippet?.thumbnails?.high?.url
      }));
      playlist.error = null;
    } catch (fallbackError) {
      console.error('Alternative request failed:', fallbackError);
    }
}
private async tryLocalFallback(playlist: any) {
    try {
      // Intenta con una URL que incluya el origen
      const url = `${this.API_URL}/playlistItems?part=snippet&maxResults=20&playlistId=${playlist.id}&key=${this.API_KEY}&origin=http://localhost:4200`;
      const response: any = await this.http.get(url).toPromise();
      playlist.videos = response.items.map((item: any) => ({
        id: item.snippet?.resourceId?.videoId,
        title: item.snippet?.title,
        thumbnail: item.snippet?.thumbnails?.high?.url
      }));
      playlist.error = null;
    } catch (fallbackError) {
      console.error('Fallback request failed:', fallbackError);
    }
}
  private async trySimpleRequest(playlist: any) {
    try {
      const simpleUrl = `${this.API_URL}/playlistItems?part=snippet&maxResults=20&playlistId=${playlist.id}&key=${this.API_KEY}`;
      const response: any = await this.http.get(simpleUrl).toPromise();
      playlist.videos = response.items.map((item: any) => ({
        id: item.snippet?.resourceId?.videoId,
        title: item.snippet?.title,
        thumbnail: item.snippet?.thumbnails?.high?.url
      }));
      playlist.error = null;
    } catch (simpleError) {
      console.error('Simple request also failed:', simpleError);
    }
  }

  
private getErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'Error de autenticación. Verifica tu clave API.';
    } else if (error.status === 403) {
      return 'Límite de cuota excedido. Intenta mañana.';
    } else if (error.status === 404) {
      return 'Lista no encontrada.';
    }
    return 'Error al cargar los videos.';
  }
    searchVideos() {
      if (!this.searchQuery.trim()) {
        this.errorMessage = 'Por favor ingresa un término de búsqueda';
        return;
      }

      this.loadingSearch = true;
      this.errorMessage = '';
      this.searchResults = [];

      const query = `${this.searchQuery} ejercicio gimnasio fitness`;
      const url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=20&key=${this.API_KEY}`;

      this.http.get(url).subscribe({
        next: (response: any) => {
          if (response.items && response.items.length > 0) {
            this.searchResults = response.items;
          } else {
            this.errorMessage = 'No se encontraron videos. Intenta con otro término.';
          }
          this.loadingSearch = false;
        },
        error: (err) => {
          console.error('Error searching videos:', err);
          this.errorMessage = 'Error al buscar videos. Intenta nuevamente.';
          this.loadingSearch = false;
        }
      });
    }

    selectVideo(video: any) {
      this.selectedVideo = video;
    }

    getSafeUrl(videoId: string): SafeResourceUrl {
      const url = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  getVideoTitle(video: any): string {
    return video?.snippet?.title || video?.title || 'Título no disponible';
  }
getThumbnailUrl(video: any): string { 
    // Cadena de comprobación segura
    return video?.snippet?.thumbnails?.high?.url || 
           video?.snippet?.thumbnails?.medium?.url || 
           video?.snippet?.thumbnails?.default?.url ||
           'https://via.placeholder.com/320x180?text=No+Thumbnail';
}
  }