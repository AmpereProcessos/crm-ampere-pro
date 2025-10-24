import React, { useState } from "react";
type NewUserGroupProps = {
	closeModal: () => void;
};

function NewUserGroup() {
	const [infoHolder, setInfoHolder] = useState({
		nome: "",
	});
	return <div>NewUserGroup</div>;
}

export default NewUserGroup;
