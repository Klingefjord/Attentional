import React from 'react'

const Separator = props => {
    return (
        <div style={{
            width: '100%',
            height: '1px',
            marginTop: '16px',
            marginBottom: '16px',
            background: '#E4E4E4',
            ...props.style
        }} />
    )
}

export default Separator