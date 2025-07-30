  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { HttpClient, HttpClientModule } from '@angular/common/http';
  import { FormsModule } from '@angular/forms';
  import { MatButtonModule } from '@angular/material/button';
  import { MatInputModule } from '@angular/material/input';
  import { MatCardModule } from '@angular/material/card';
  import { MatTabsModule } from '@angular/material/tabs';
  import { MatIconModule } from '@angular/material/icon';
  import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
  import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

    // API Key de YouTube (reemplaza con la tuya)
    readonly API_KEY = 'AIzaSyCULEyRmh_DCliNZbrVrZbTH7fg8rqcf3o';

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

    loadPlaylistVideos(playlist: any) {
      if (playlist.videos.length > 0) return;

      playlist.loading = true;
      playlist.error = false;
      
      const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=20&playlistId=${playlist.id}&key=${this.API_KEY}`;

      this.http.get(url).subscribe({
        next: (response: any) => {
          if (response.items && response.items.length > 0) {
            playlist.videos = response.items.map((item: any) => ({
              ...item,
              id: item.snippet.resourceId.videoId
            }));
          } else {
            playlist.error = true;
          }
          playlist.loading = false;
        },
        error: (err) => {
          console.error('Error loading playlist:', err);
          playlist.error = true;
          playlist.loading = false;
        }
      });
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

    getThumbnailUrl(video: any): string {
      return video.snippet.thumbnails?.high?.url || '';
    }
  }