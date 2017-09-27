import Question from './Question'
import React from 'react'
import RcUpload from 'rc-upload';

export class Uploader extends Question {
    constructor(props) {
        super(props);
        this.state.className = 'uploader';
    }

    beforeUpload(file) {
        let fileLt2Mb = file.size < 2 * 1024 * 1024;
        if(!fileLt2Mb){
            alert('上传的文件不能大于2MB');
        }
        return fileLt2Mb;
    }

    onSuccess(resp,file) {
        super.fillInResponse(resp.url)
        this.setState({
            fileName:file.name,
            value:resp.url
        });
    }

    onError(err) {
        console.log('onError', err);
        super.resetResponse()
    }

    data(){
        return { name : `${this.props.responseItem.responseId}-${this.props.question.id}`}
    }


    body() {
        let inputType = this.props.question.type;
        let uploadedView,accept;
        if(inputType === 'FILE_UPLOAD' || inputType === 'AUDIO_UPLOAD') {
            accept = "*/*";
            uploadedView = <a href={this.state.value} target="_blank">{this.state.fileName}</a>;
        } else if(inputType === 'IMAGE_UPLOAD' ){
            accept = "image/*";
            uploadedView = <img width='100%' alt={this.state.fileName} src={this.state.value} />
        }

        let uploaderText = '点击上传';
        if(this.state.value){
            uploaderText = '点击重新上传';
        }
        return (
            <div className="question-body uploader">
                <RcUpload action='/api/upload'
                          accept={accept}
                          data={this.data.bind(this)}
                          beforeUpload={this.beforeUpload.bind(this)}
                          onSuccess={this.onSuccess.bind(this)}
                          onError={this.onError.bind(this)}>
                    <button type="button" className="btn btn-default" disabled={this.props.readOnly}><em className="glyphicon glyphicon-upload" /> {uploaderText}</button>
                </RcUpload>
                <div hidden={!this.state.value} className="file-list">
                    {uploadedView}
                </div>
            </div>
        )

    }
}