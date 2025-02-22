// src/hooks/useAnimatedCount.js (No changes)
import { useState, useEffect } from "react";

const useAnimatedCount = (count, loading) => {
	const [displayValue, setDisplayValue] = useState(null);

	useEffect(() => {
		if (count === null && !loading) {
			setDisplayValue("N/A");
		} else {
			setDisplayValue(count); // Update even if loading, for immediate display
		}
	}, [count, loading]);

	return displayValue;
};

export default useAnimatedCount;
