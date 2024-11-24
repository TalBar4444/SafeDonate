import { Link } from "react-router-dom";
import {replaceTildesAlgorithm} from "../utils/filterText.js";

/**
 * Displays a preview card for an association with its name and goals
 */
const AssociationCard = ({ association, userId }) => {
    // Clean and format the association data
    const aName = replaceTildesAlgorithm(association["שם עמותה בעברית"])
    const aNumber = association["מספר עמותה"]
    let goals = replaceTildesAlgorithm(association["מטרות עמותה"]) || 
        "המידע אודות מטרות העמותה אינו זמין כרגע. ייתכן כי העמותה טרם רשמה את מטרותיה באופן רשמי."
    
    // Truncate goals text if longer than 100 characters
    if(goals.length > 100) goals = goals.slice(0, 100) + "..."
    const link = `/AssociationPage/${aNumber}`

    return (
        <div className="space-y-4  text-[#161616]">
            <Link to={link}>
                <div className="text-2xl p-2">{aName}</div>
                <div>{goals}</div>
            </Link>
        </div>
    )
}

export default AssociationCard;