import { useRef } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import type { CertificateRequest } from '../App';
import logo from 'figma:asset/5a628905b12ce4e42a9932ee6f62a2beed6d0dc3.png';
import naacLogo from 'figma:asset/bf2101b1a58326bcb376bb5f83ce99331b57e3df.png';
import signatureImg from 'figma:asset/17c55b6fd3d32bceab53df496299dab331adae02.png';

interface CertificateProps {
  certificate: CertificateRequest;
  onBack: () => void;
}

export function Certificate({ certificate, onBack }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    // Dynamic import of html-to-image and jsPDF
    const { toPng } = await import('html-to-image');
    const { jsPDF } = await import('jspdf');

    if (pdfRef.current) {
      // Hide download button temporarily
      const downloadBtn = document.getElementById('download-btn');
      if (downloadBtn) downloadBtn.style.display = 'none';

      try {
        const dataUrl = await toPng(pdfRef.current, {
          quality: 1,
          pixelRatio: 3, // Higher resolution for better quality
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123,
        });

        // Show download button again
        if (downloadBtn) downloadBtn.style.display = 'flex';

        // Create PDF with A4 dimensions
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
        
        // Add image to fill the entire page
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Bonafide_Certificate_${certificate.usn}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        // Show download button again even if there's an error
        if (downloadBtn) downloadBtn.style.display = 'flex';
      }
    }
  };

  // Determine course based on USN pattern (IS = Information Science, etc.)
  const determineCourse = (usn: string) => {
    if (usn.includes('IS')) return 'Information Science and Engineering';
    if (usn.includes('CS')) return 'Computer Science and Engineering';
    if (usn.includes('EC')) return 'Electronics and Communication Engineering';
    if (usn.includes('ME')) return 'Mechanical Engineering';
    if (usn.includes('CV')) return 'Civil Engineering';
    return 'Engineering';
  };

  const determineDegree = (year: string) => {
    return 'B.E.';
  };

  const formatDate = (dateString?: string) => {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Download Button */}
        <div id="download-btn" className="flex justify-end mb-4">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        </div>

        {/* Certificate Container - Scrollable on mobile */}
        <div className="overflow-x-auto overflow-y-auto max-h-[80vh] md:max-h-none">
          {/* Certificate */}
          <div id="certificate-content" ref={certificateRef} style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '8px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
            padding: '48px', 
            position: 'relative', 
            overflow: 'hidden',
            fontFamily: '"Times New Roman", Times, serif',
            height: '1123px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Watermark */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              opacity: 0.05, 
              pointerEvents: 'none' 
            }}>
              <div style={{ textAlign: 'center', transform: 'rotate(-30deg)' }}>
                <p style={{ fontSize: '120px', fontWeight: 'bold', lineHeight: 1.2, color: '#000000', margin: 0 }}>
                  GLOBAL ACADEMY<br />OF TECHNOLOGY
                </p>
                <p style={{ fontSize: '60px', marginTop: '20px', color: '#000000', margin: '20px 0 0 0' }}>
                  growing ahead of time
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
              {/* Header with Logos */}
              <div style={{ position: 'relative', marginBottom: '16px', paddingBottom: '16px', borderBottom: '2px solid #000000' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Left Logo */}
                  <div style={{ width: '100px', flexShrink: 0 }}>
                    <img 
                      src={logo} 
                      alt="GAT Logo" 
                      style={{ 
                        width: '100px', 
                        height: 'auto',
                        objectFit: 'contain'
                      }} 
                    />
                  </div>

                  {/* Center Text */}
                  <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                    <h1 style={{ fontSize: '32px', letterSpacing: '1px', marginBottom: '8px', color: '#000000', margin: '0 0 8px 0', fontWeight: 'bold' }}>
                      Global Academy of Technology
                    </h1>
                    <p style={{ fontSize: '11px', lineHeight: 1.4, color: '#6b7280', margin: 0 }}>
                      (Autonomous Institution Affiliated to Visvesvaraya Technological University,<br />
                      Belagavi and Approved by UGC, AICTE, and Govt of Karnataka)
                    </p>
                  </div>

                  {/* Right Logo */}
                  <div style={{ width: '100px', flexShrink: 0 }}>
                    <img 
                      src={naacLogo} 
                      alt="NAAC Logo" 
                      style={{ 
                        width: '100px', 
                        height: 'auto',
                        objectFit: 'contain'
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Reference and Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid #000000' }}>
                <div>
                  <p style={{ color: '#000000', margin: 0, fontSize: '16px' }}>
                    <span style={{ fontWeight: 600 }}>Ref. No. : {certificate.certificateNumber || 'GAT/GEN/BC/2025-2026/001'}</span>
                  </p>
                </div>
                <div>
                  <p style={{ color: '#000000', margin: 0, fontSize: '16px' }}>
                    <span style={{ fontWeight: 600 }}>Date: {formatDate(certificate.approvedDate)}</span>
                  </p>
                </div>
              </div>

              {/* Title */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ 
                  fontSize: '28px', 
                  textDecoration: 'underline',
                  letterSpacing: '4px',
                  textUnderlineOffset: '8px',
                  color: '#000000',
                  margin: 0,
                  fontWeight: 'bold'
                }}>
                  BONAFIDE CERTIFICATE
                </h2>
              </div>

              {/* Content */}
              <div style={{ marginBottom: '24px', fontSize: '18px', lineHeight: 2 }}>
                <p style={{ color: '#111827', marginBottom: '24px', margin: '0 0 24px 0', textAlign: 'justify' }}>
                  This is to certify that <span style={{ fontWeight: 'bold' }}>Mr. {certificate.studentName}</span>, S/o Sri. {certificate.fatherName}, bearing USN <span style={{ fontWeight: 'bold' }}>{certificate.usn}</span>, is a student of <span style={{ fontWeight: 'bold' }}>Global Academy of Technology</span>, studying in {certificate.semester} semester / {certificate.year} year <span style={{ fontWeight: 'bold' }}>B.E.</span>, in <span style={{ fontWeight: 'bold' }}>{certificate.department}</span> course during the current academic year {new Date().getFullYear()}-{new Date().getFullYear() + 1}.
                </p>

                <p style={{ color: '#111827', marginBottom: '24px', margin: '0 0 24px 0', textAlign: 'justify' }}>
                  This certificate is issued for the purpose of {certificate.purpose.toLowerCase()}.
                </p>

                <div style={{ marginTop: '60px', position: 'relative' }}>
                  <img 
                    src={signatureImg} 
                    alt="Principal's Signature" 
                    style={{ 
                      width: '140px', 
                      height: 'auto',
                      marginBottom: '8px',
                      objectFit: 'contain',
                      display: 'block'
                    }} 
                  />
                  <p style={{ fontWeight: 'bold', fontSize: '18px', color: '#000000', margin: 0 }}>PRINCIPAL</p>
                </div>
              </div>
            </div>

            {/* Footer - Always at bottom */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '2px solid #000000' }}>
              <p style={{ fontSize: '10px', lineHeight: 1.5, color: '#000000', textAlign: 'center', margin: 0 }}>
                Rajarajeshwari Nagar, Bengaluru – 560 098, INDIA.<br />
                Phone: +91-080-28603158, 28603157 Tele Fax: +91-080-28603157, E-mail:info@gat.ac.in Website: ww.gat.ac.in
              </p>
            </div>
          </div>
        </div>

        {/* Hidden PDF Version - Fixed A4 Size - For PDF Generation Only */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div ref={pdfRef} style={{ 
            backgroundColor: '#ffffff', 
            padding: '48px', 
            position: 'relative', 
            overflow: 'hidden',
            fontFamily: '"Times New Roman", Times, serif',
            width: '794px',
            height: '1123px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Watermark */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              opacity: 0.05, 
              pointerEvents: 'none' 
            }}>
              <div style={{ textAlign: 'center', transform: 'rotate(-30deg)' }}>
                <p style={{ fontSize: '120px', fontWeight: 'bold', lineHeight: 1.2, color: '#000000', margin: 0 }}>
                  GLOBAL ACADEMY<br />OF TECHNOLOGY
                </p>
                <p style={{ fontSize: '60px', marginTop: '20px', color: '#000000', margin: '20px 0 0 0' }}>
                  growing ahead of time
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
              {/* Header with Logos */}
              <div style={{ position: 'relative', marginBottom: '16px', paddingBottom: '16px', borderBottom: '2px solid #000000' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Left Logo */}
                  <div style={{ width: '100px', flexShrink: 0 }}>
                    <img 
                      src={logo} 
                      alt="GAT Logo" 
                      style={{ 
                        width: '100px', 
                        height: 'auto',
                        objectFit: 'contain'
                      }} 
                    />
                  </div>

                  {/* Center Text */}
                  <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                    <h1 style={{ fontSize: '32px', letterSpacing: '1px', marginBottom: '8px', color: '#000000', margin: '0 0 8px 0', fontWeight: 'bold' }}>
                      Global Academy of Technology
                    </h1>
                    <p style={{ fontSize: '11px', lineHeight: 1.4, color: '#6b7280', margin: 0 }}>
                      (Autonomous Institution Affiliated to Visvesvaraya Technological University,<br />
                      Belagavi and Approved by UGC, AICTE, and Govt of Karnataka)
                    </p>
                  </div>

                  {/* Right Logo */}
                  <div style={{ width: '100px', flexShrink: 0 }}>
                    <img 
                      src={naacLogo} 
                      alt="NAAC Logo" 
                      style={{ 
                        width: '100px', 
                        height: 'auto',
                        objectFit: 'contain'
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Reference and Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid #000000' }}>
                <div>
                  <p style={{ color: '#000000', margin: 0, fontSize: '16px' }}>
                    <span style={{ fontWeight: 600 }}>Ref. No. : {certificate.certificateNumber || 'GAT/GEN/BC/2025-2026/001'}</span>
                  </p>
                </div>
                <div>
                  <p style={{ color: '#000000', margin: 0, fontSize: '16px' }}>
                    <span style={{ fontWeight: 600 }}>Date: {formatDate(certificate.approvedDate)}</span>
                  </p>
                </div>
              </div>

              {/* Title */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ 
                  fontSize: '28px', 
                  textDecoration: 'underline',
                  letterSpacing: '4px',
                  textUnderlineOffset: '8px',
                  color: '#000000',
                  margin: 0,
                  fontWeight: 'bold'
                }}>
                  BONAFIDE CERTIFICATE
                </h2>
              </div>

              {/* Content */}
              <div style={{ marginBottom: '24px', fontSize: '18px', lineHeight: 2 }}>
                <p style={{ color: '#111827', marginBottom: '24px', margin: '0 0 24px 0', textAlign: 'justify' }}>
                  This is to certify that <span style={{ fontWeight: 'bold' }}>Mr. {certificate.studentName}</span>, S/o Sri. {certificate.fatherName}, bearing USN <span style={{ fontWeight: 'bold' }}>{certificate.usn}</span>, is a student of <span style={{ fontWeight: 'bold' }}>Global Academy of Technology</span>, studying in {certificate.semester} semester / {certificate.year} year <span style={{ fontWeight: 'bold' }}>B.E.</span>, in <span style={{ fontWeight: 'bold' }}>{certificate.department}</span> course during the current academic year {new Date().getFullYear()}-{new Date().getFullYear() + 1}.
                </p>

                <p style={{ color: '#111827', marginBottom: '24px', margin: '0 0 24px 0', textAlign: 'justify' }}>
                  This certificate is issued for the purpose of {certificate.purpose.toLowerCase()}.
                </p>

                <div style={{ marginTop: '60px', position: 'relative' }}>
                  <img 
                    src={signatureImg} 
                    alt="Principal's Signature" 
                    style={{ 
                      width: '140px', 
                      height: 'auto',
                      marginBottom: '8px',
                      objectFit: 'contain',
                      display: 'block'
                    }} 
                  />
                  <p style={{ fontWeight: 'bold', fontSize: '18px', color: '#000000', margin: 0 }}>PRINCIPAL</p>
                </div>
              </div>
            </div>

            {/* Footer - Always at bottom */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '2px solid #000000' }}>
              <p style={{ fontSize: '10px', lineHeight: 1.5, color: '#000000', textAlign: 'center', margin: 0 }}>
                Rajarajeshwari Nagar, Bengaluru – 560 098, INDIA.<br />
                Phone: +91-080-28603158, 28603157 Tele Fax: +91-080-28603157, E-mail:info@gat.ac.in Website: ww.gat.ac.in
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}