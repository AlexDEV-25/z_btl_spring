import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-test-connection',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="test-container">
            <h3>Test Connection</h3>
            <button (click)="testBackend()" [disabled]="testing">
                {{ testing ? 'Testing...' : 'Test Backend Connection' }}
            </button>
            <div *ngIf="result" class="result" [class.success]="result.success" [class.error]="!result.success">
                <h4>{{ result.success ? 'Success' : 'Error' }}</h4>
                <pre>{{ result.message }}</pre>
            </div>
        </div>
    `,
    styles: [`
        .test-container {
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        .result.success {
            background: #d4edda;
            border-color: #c3e6cb;
            color: #155724;
        }
        .result.error {
            background: #f8d7da;
            border-color: #f5c6cb;
            color: #721c24;
        }
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }
    `]
})
export class TestConnectionComponent implements OnInit {
    testing = false;
    result: any = null;

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.testBackend();
    }

    testBackend() {
        this.testing = true;
        this.result = null;

        // Test teacher debug endpoint
        this.http.get('/api/teacher/debug', { observe: 'response' }).subscribe({
            next: (response) => {
                this.result = {
                    success: true,
                    message: `Backend is running!\nStatus: ${response.status}\nURL: ${response.url}\n\nDebug Info:\n${JSON.stringify(response.body, null, 2)}`
                };
                this.testing = false;
            },
            error: (error) => {
                this.result = {
                    success: false,
                    message: `Backend connection failed!\nStatus: ${error.status}\nError: ${error.message}\nURL: ${error.url}\n\nError details:\n${JSON.stringify(error, null, 2)}`
                };
                this.testing = false;
            }
        });
    }
}
