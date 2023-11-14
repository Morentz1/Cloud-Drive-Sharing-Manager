import { FileCard } from './';
import {v4 as uuidv4} from 'uuid';

export default function WorkSpace(props) {
    props.data.sort((a,b)=> a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    return (
        <table >
            <thead className="border-b-2 border-gray-200">
                <tr id="heading" className="filecard ">
                    <th>
                        <input
                            className="allfile-checkbox"
                            onChange={props.handleAllFileCheckbox}
                            type='checkbox'
                            style={{ visibility: props.visible ? 'visible' : 'hidden' }} //
                        />
                    </th>
                    <th id="heading-name" className="pl-6"> Name </th>
                    <th id="heading-owner"> Owner </th>
                    <th id="heading-dateCreated"> Date Created </th>
                </tr>
            </thead>
            <tbody >
                {props.data.map((file) => (
                    <FileCard 
                        handleGroupToShow={props.handleGroupToShow}
                        key={file.id}
                        file={file}
                        visible={props.visible}
                        handleFileCheckBox={props.handleFileCheckBox}
                        handleClickFolder={props.handleClickFolder} />
                ))}
            </tbody>
        </table>
    );
}
