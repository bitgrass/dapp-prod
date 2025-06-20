import React, { useRef, useState } from 'react';

const Showcode = ({ title,code,children, customCardClass, customCardHeaderClass, customCardBodyClass, customCardFooterClass }:any) => {

  const [showCode, setShowCode] = useState(false);
  const randomValueRef :any= useRef(`reference${Math.ceil(Math.random() * 999)}`);

  const toggleCode = () => {
    setShowCode(!showCode);
  };

  const sanitizedCode = () => {
    const referenceVariable = randomValueRef.current;
   const codeContent = referenceVariable?.innerHTML?.replace(/</gm, '\n\n$&').replace(/</gm, '&lt;').replace(/^\s+/gim, '') || '';
    return codeContent;
  };

  return (
    <div className={`box ${customCardClass}`}>
      <div className={`box-header justify-content-between ${customCardHeaderClass}`}>
        <div className="box-title" dangerouslySetInnerHTML={{ __html: title }}></div>
        <div className="prism-toggle">
          <button type="button" className="ti-btn !py-1 !px-2 ti-btn-primary !text-[0.75rem] !font-medium"  onClick={toggleCode}>Show
                                    Code  <i className={`${showCode ? 'ri-code-s-slash-line' : 'ri-code-line'} ms-2 align-middle inline-block`}></i></button>
        </div>
      </div>
      <div ref={randomValueRef} className={`box-body ${customCardBodyClass}`} style={{ display: showCode ? 'none' : 'block' }}>
        {React.Children.map(children, child => React.cloneElement(child))}
      </div>
      <div className={`box-footer !border-t-0 ${customCardFooterClass}`} style={{ display: showCode ? 'block' : 'none' }}>
        <pre className="language-html">
          <code className="language-html" >{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default Showcode;



