import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatService } from '../../core/services/call-api/chat.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { ChatData } from '../../core/models/call-api/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isOpen: boolean = false;
  @Output() openChange = new EventEmitter<boolean>();
  @ViewChild('messagesContainer') messagesContainer?: ElementRef;
  
  chatData: ChatData | null = null;
  isLoading: boolean = true;
  error: string = '';
  currentUser: string = '';
  currentMessage: string = '';
  
  messages: Array<{ 
    sender: 'user' | 'assistant' | 'system', 
    text: string,
    timestamp: Date 
  }> = [];
  
  private subscriptions: Subscription[] = [];
  
  constructor(
    private chatService: ChatService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('Chat component initialized');
    this.getCurrentUser();
    this.messages.push({
      sender: 'system',
      text: '¡Bienvenido a Lectoria Chat!',
      timestamp: new Date()
    });
    this.messages.push({
      sender: 'assistant',
      text: '¡Hola! Soy tu asistente de lectura. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  onOpen(): void {
    console.log('Opening chat');
    this.isOpen = true;
    this.openChange.emit(true);
    
    if (this.currentUser) {
      this.loadChatData();
    }
    
    this.scrollToBottom();
  }

  onClose(): void {
    console.log('Closing chat');
    this.isOpen = false;
    this.openChange.emit(false);
  }

  getCurrentUser(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentUser = user.nickname;
      console.log('Current user:', this.currentUser);
      
      if (this.isOpen) {
        this.loadChatData();
      }
    } else {
      this.error = 'No se ha encontrado un usuario activo.';
      this.isLoading = false;
    }
  }

  loadChatData(): void {
    if (!this.currentUser) {
      this.error = 'No se ha encontrado un usuario activo.';
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    console.log('Loading chat data for user:', this.currentUser);
    
    const subscription = this.chatService.getChatData(this.currentUser)
      .subscribe({
        next: (data) => {
          console.log('Chat data loaded successfully:', data);
          this.chatData = data;
          this.isLoading = false;
          
          if (data && data.reading_stats) {
            const completedBooks = data.reading_stats.completed_books || '0';
            const favoriteAuthor = data.reading_stats.favorite_author || 'ninguno destacado';
            const message = `He cargado tus datos de lectura. Has completado ${completedBooks} libros y tu autor favorito es ${favoriteAuthor}.`;
            
            if (!this.messages.some(m => m.text.includes('He cargado tus datos de lectura'))) {
              this.messages.push({
                sender: 'assistant',
                text: message,
                timestamp: new Date()
              });
              this.scrollToBottom();
            }
          }
        },
        error: (err) => {
          console.error('Error loading chat data:', err);
          this.error = 'No se pudieron cargar los datos del chat. ' + (err.message || '');
          this.isLoading = false;
        }
      });
      
    this.subscriptions.push(subscription);
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || !this.currentUser) return;
    
    this.messages.push({ 
      sender: 'user', 
      text: this.currentMessage,
      timestamp: new Date()
    });
    
    const userQuery = this.currentMessage;
    this.currentMessage = '';
    
    this.scrollToBottom();
    
    const loadingIndex = this.messages.length;
    this.messages.push({ 
      sender: 'assistant', 
      text: '...',
      timestamp: new Date()
    });
    
    this.chatService.processQuery(userQuery, this.currentUser)
      .subscribe({
        next: (data) => {
          console.log('Response received:', data);
          
          if (this.messages[loadingIndex] && this.messages[loadingIndex].text === '...') {
            this.messages[loadingIndex] = {
              sender: 'assistant',
              text: data.response || 'No se recibió una respuesta válida',
              timestamp: new Date()
            };
          } else {
            this.messages.push({
              sender: 'assistant',
              text: data.response || 'No se recibió una respuesta válida',
              timestamp: new Date()
            });
          }
          
          this.scrollToBottom();
        },
        error: (err) => {
          console.error('Error processing query:', err);
          
          if (this.messages[loadingIndex] && this.messages[loadingIndex].text === '...') {
            this.messages[loadingIndex] = {
              sender: 'assistant',
              text: 'Lo siento, ocurrió un error al procesar tu consulta.',
              timestamp: new Date()
            };
          } else {
            this.messages.push({
              sender: 'assistant',
              text: 'Lo siento, ocurrió un error al procesar tu consulta.',
              timestamp: new Date()
            });
          }
          
          this.scrollToBottom();
        }
      });
  }

  formatTimestamp(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  preventClose(event: Event): void {
    event.stopPropagation();
  }
}