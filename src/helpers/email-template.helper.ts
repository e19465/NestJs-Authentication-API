export const createOutlookEmailTemplate = (
  subject: string | null,
  from: string,
  toRecipients: string[],
  ccRecipients: string[],
  date: string,
  bodyHtml: string,
  attachmentUrls: string[],
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email View</title>
    <style>
        body {
        width: 100%;
        min-height: 100vh;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        background-color: #f5f7fa;
        margin: 0;
        padding: 0;
        color: #1a1a1a;
        display: flex;
        justify-content: center;
        align-items: center;
        line-height: 1.5;
        }
        
        .container-wrapper {
        width: 100%;
        padding: 40px 20px;
        display: flex;
        justify-content: center;
        }
        
        .container {
        min-width: 680px;
        max-width: 800px;
        width: 100%;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        padding: 40px;
        box-sizing: border-box;
        border: 1px solid #e1e5eb;
        }
        
        .header {
        padding-bottom: 16px;
        margin-bottom: 24px;
        border-bottom: 1px solid #eaeff5;
        }
        
        .header h2 {
        font-size: 28px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: #1d1d1f;
        line-height: 1.3;
        }
        
        .meta {
        font-size: 14px;
        color: #5a5a5a;
        }
        
        .meta-row {
        display: flex;
        margin-bottom: 8px;
        flex-wrap: wrap;
        }
        
        .meta-label {
        font-weight: 500;
        width: 80px;
        color: #3a3a3a;
        flex-shrink: 0;
        }
        
        .meta-value {
        flex: 1;
        min-width: 0;
        word-break: break-word;
        }
        
        .body-content {
        margin: 32px 0;
        line-height: 1.6;
        color: #2d2d2d;
        }
        
        .body-content p {
        margin: 0 0 16px 0;
        }
        
        .body-content p:last-child {
        margin-bottom: 0;
        }
        
        .attachments {
        margin-top: 40px;
        padding-top: 24px;
        border-top: 1px solid #eaeff5;
        }
        
        .attachments-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #3a3a3a;
        }
        
        .attachment-list {
        list-style: none;
        padding-left: 0;
        margin: 0;
        }
        
        .attachment-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        padding: 12px 16px;
        background: #f8fafc;
        border: 1px solid #e1e8f0;
        border-radius: 8px;
        transition: all 0.2s ease;
        }
        
        .attachment-item:hover {
        background: #f0f5ff;
        border-color: #d0ddf0;
        transform: translateY(-1px);
        }
        
        .attachment-icon {
        width: 20px;
        height: 20px;
        margin-right: 12px;
        flex-shrink: 0;
        color: #4a6cf7;
        }
        
        .attachment-link {
        color: #4a6cf7;
        text-decoration: none;
        font-weight: 500;
        word-break: break-all;
        transition: color 0.2s;
        }
        
        .attachment-link:hover {
        color: #3a5ce4;
        text-decoration: underline;
        }
        
        @media (max-width: 768px) {
        .container {
            min-width: auto;
            width: 100%;
            padding: 24px;
            border-radius: 0;
        }
        
        .meta-label {
            width: 100%;
            margin-bottom: 4px;
        }
        }
    </style>
    </head>
    <body>
    <div class="container-wrapper">
        <div class="container">
        <div class="header">
            <h2>${subject || 'No Subject'}</h2>
        </div>
        <div class="meta">
            <div class="meta-row">
            <div class="meta-label">From:</div>
            <div class="meta-value">${from}</div>
            </div>
            <div class="meta-row">
            <div class="meta-label">To:</div>
            <div class="meta-value">${toRecipients.join(', ')}</div>
            </div>
            <div class="meta-row">
            <div class="meta-label">CC:</div>
            <div class="meta-value">${ccRecipients.join(', ') || '-'}</div>
            </div>
            <div class="meta-row">
            <div class="meta-label">Date:</div>
            <div class="meta-value">${date}</div>
            </div>
        </div>
        <div class="body-content">
            ${bodyHtml}
        </div>

        ${
          attachmentUrls.length > 0
            ? `<div class="attachments">
                <div class="attachments-title">Attachments (${attachmentUrls.length}):</div>
                <ul class="attachment-list">
                    ${attachmentUrls
                      .map(
                        (url, idx) => `
                        <li class="attachment-item">
                        <div class="attachment-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 10.9696L11.9628 18.5497C10.9782 19.4783 9.64274 20 8.25028 20C6.85782 20 5.52239 19.4783 4.53777 18.5497C3.55315 17.6211 3 16.3616 3 15.0483C3 13.7351 3.55315 12.4756 4.53777 11.547L12.575 3.96687C13.2314 3.34779 14.1217 3 15.05 3C15.9783 3 16.8686 3.34779 17.525 3.96687C18.1814 4.58595 18.5502 5.4256 18.5502 6.30111C18.5502 7.17662 18.1814 8.01628 17.525 8.63535L9.47904 16.2154C9.15083 16.525 8.70569 16.6989 8.24154 16.6989C7.77738 16.6989 7.33224 16.525 7.00403 16.2154C6.67583 15.9059 6.49144 15.4861 6.49144 15.0483C6.49144 14.6106 6.67583 14.1907 7.00403 13.8812L14.429 6.88674" 
                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <a class="attachment-link" href="${url}" target="_blank" rel="noopener noreferrer">${url.split('/').pop() || `Attachment ${idx + 1}`}</a>
                        </li>
                    `,
                      )
                      .join('')}
                </ul>
                </div>`
            : ''
        }
        </div>
    </div>
    </body>
    </html>`;
};
