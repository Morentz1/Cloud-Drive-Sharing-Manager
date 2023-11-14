import { SearchBar, LogOutButton, AppLogo } from "./";

export default function UserNavBar( props ) {
    return (
        <div className="flex flex-nowrap justify-between p-3">
            <div>
                <AppLogo />
            </div>
            <SearchBar  handleQuery={props.handleQuery}
                        handleQueryBuilderButton={props.handleQueryBuilderButton} />
            <div>
                <LogOutButton />
            </div>
        </div>
    );
}
