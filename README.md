#  Send to Myself — Quick Personal Note Sender

 **Instant Personal Note & Link Dispatcher**  
 A lightweight, frictionless web application designed to quickly send notes, thoughts, and web links directly to yourself without extra overhead.

Powered by a **Node.js + Express** backend proxy architecture, all data requests are processed securely without exposing sensitive configuration details or API credentials on the client side.


##  System Architecture Diagram

The flow of data from the client interface to backend processing:

```mermaid
sequenceDiagram
    autonumber
    actor User as  User / Browser
    participant Frontend as  Frontend (HTML/JS)
    participant Express as  Express Backend (server.js)
    participant Storage as  Storage / Email Service

    User->>Frontend: Input note / paste URL
    User->>Frontend: Click "Send to Myself"
    Frontend->>Frontend: Validate input & show loading state
    Frontend->>Express: POST /api/send-note (JSON Payload)
    
    note over Express: Sanitize text & check server configuration
    
    Express->>Storage: Execute dispatch / store note
    Storage-->>Express: Confirm success status (HTTP 200)
    
    Express-->>Frontend: Response JSON ({ success: true })
    Frontend-->>User: Display "Sent Successfully!" alert & reset form