import React from "react";

const ToolBar = ({ id }: { id: string }) => {
  return (
    // wip add link header and image option
    <div className="text-editor hidden sm:block w-full sm:max-w-3xl rounded-xl">
      <div
        id={id}
        className="flex flex-wrap bg-bg text-text px-2 py-1 rounded-t-md"
      >
        {/* <select defaultValue="" className="ql-header bg-bg text-text">
          <option value="1">Heading</option>
          <option value="2">Subheading</option>
          <option value="">Normal</option>
        </select> */}
        <button className="ql-bold hover:text-accent" />
        <button className="ql-italic hover:text-accent" />
        <button className="ql-underline hover:text-accent" />
        <button className="ql-strike hover:text-accent" />
        <button className="ql-blockquote hover:text-accent" />
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
        {/* <button className="ql-link hover:text-accent" />
        <button className="ql-image hover:text-accent" /> */}
        <button className="ql-indent" value="-1" />
        <button className="ql-indent" value="+1" />
        <button className="ql-align" value="" />
        <button className="ql-align" value="center" />
        <button className="ql-align" value="right" />
        <button className="ql-align" value="justify" />
      </div>
    </div>
  );
};

export default ToolBar;
