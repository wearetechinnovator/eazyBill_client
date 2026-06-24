import React from 'react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#E6ECDF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '20px'
    }}>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          .number-404 {
            animation: fadeInUp 0.8s ease-out;
          }

          .title {
            animation: fadeInUp 0.8s ease-out 0.2s both;
          }

          .description {
            animation: fadeInUp 0.8s ease-out 0.4s both;
          }

          .buttons {
            animation: fadeInUp 0.8s ease-out 0.6s both;
          }

          .float-icon {
            animation: float 3s ease-in-out infinite;
          }
        `}
      </style>

      <div style={{
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        {/* 404 Number */}
        <div className="number-404" style={{
          fontSize: '120px',
          fontWeight: '700',
          color: '#003E32',
          lineHeight: '1',
          marginBottom: '20px',
          letterSpacing: '-2px'
        }}>
          404
        </div>

        {/* Title */}
        <h1 className="title" style={{
          fontSize: '28px',
          fontWeight: '600',
          color: '#003E32',
          marginBottom: '16px',
          marginTop: '0'
        }}>
          Page Not Found
        </h1>

        {/* Description */}
        <p className="description" style={{
          fontSize: '16px',
          color: '#003E32',
          opacity: '0.8',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          The billing page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="buttons" style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: '#003E32',
              color: '#E6ECDF',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 62, 50, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => window.history.back()}
            style={{
              backgroundColor: 'transparent',
              color: '#003E32',
              border: '2px solid #003E32',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#003E32';
              e.target.style.color = '#E6ECDF';
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 62, 50, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#003E32';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}